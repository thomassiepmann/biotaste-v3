#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { randomInt } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const PRIZES = {
  random_1: '10€ Gutschein',
  random_2: '5€ Gutschein',
  random_3: 'Überraschungsbox',
  quality: 'Qualitäts-Preis',
};

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const weekArg = args.find((a) => a.startsWith('--week='))?.split('=')[1] ?? null;

function loadOptionalEnvFiles() {
  const cwd = process.cwd();
  const envFiles = ['.env.local', '.env'];

  for (const fileName of envFiles) {
    const filePath = resolve(cwd, fileName);
    if (!existsSync(filePath)) continue;

    const content = readFileSync(filePath, 'utf8');
    for (const rawLine of content.split('\n')) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;

      const separator = line.indexOf('=');
      if (separator <= 0) continue;

      const key = line.slice(0, separator).trim();
      const value = line.slice(separator + 1).trim().replace(/^['"]|['"]$/g, '');
      if (!key) continue;

      if (process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  }
}

function isoWeekToMonday(isoWeek) {
  const match = /^(\d{4})-W(\d{2})$/.exec(isoWeek);
  if (!match) return null;

  const year = Number(match[1]);
  const week = Number(match[2]);
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7;
  const mondayWeek1 = new Date(jan4);
  mondayWeek1.setUTCDate(jan4.getUTCDate() - jan4Day + 1);
  const monday = new Date(mondayWeek1);
  monday.setUTCDate(mondayWeek1.getUTCDate() + (week - 1) * 7);
  return monday;
}

function resolveWeekStart(input) {
  if (!input) {
    const now = new Date();
    const day = now.getUTCDay() || 7;
    const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    monday.setUTCDate(monday.getUTCDate() - day + 1);
    return monday;
  }

  const fromIsoWeek = isoWeekToMonday(input);
  if (fromIsoWeek) return fromIsoWeek;

  const asDate = new Date(`${input}T00:00:00.000Z`);
  if (!Number.isNaN(asDate.getTime())) return asDate;

  throw new Error(`Ungültiges --week Format: ${input}. Erlaubt: YYYY-MM-DD oder YYYY-Www`);
}

async function run() {
  loadOptionalEnvFiles();

  const weekStartDate = resolveWeekStart(weekArg);
  const weekEndDate = new Date(weekStartDate);
  weekEndDate.setUTCDate(weekEndDate.getUTCDate() + 7);

  const weekStartIso = weekStartDate.toISOString();
  const weekEndIso = weekEndDate.toISOString();
  const weekStartDateOnly = weekStartIso.slice(0, 10);

  const supabaseUrl = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Fehlende ENV: SUPABASE_URL und (SUPABASE_SERVICE_ROLE_KEY oder SUPABASE_ANON_KEY)');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: ratingRows, error: ratingsError } = await supabase
    .from('ratings')
    .select('user_id, overall_stars, comment, created_at')
    .gte('created_at', weekStartIso)
    .lt('created_at', weekEndIso)
    .not('user_id', 'is', null);

  if (ratingsError) {
    throw new Error(`Fehler beim Laden von ratings: ${ratingsError.message}`);
  }

  const ratings = ratingRows ?? [];
  const participants = [...new Set(ratings.map((r) => r.user_id))];

  console.log('🎰 Weekly Draw (fair)');
  console.log(`   Woche: ${weekStartDateOnly}`);
  console.log(`   Zeitraum: ${weekStartIso} bis ${weekEndIso}`);
  console.log(`   Bewertungen: ${ratings.length}`);
  console.log(`   Teilnehmer (unique): ${participants.length}`);
  console.log(`   Modus: ${dryRun ? 'DRY RUN' : 'WRITE'}`);

  if (participants.length === 0) {
    console.log('ℹ️ Keine Teilnehmer in dieser Woche.');
    return;
  }

  const selected = [];
  const pool = [...participants];
  for (const winnerType of ['random_1', 'random_2', 'random_3']) {
    if (pool.length === 0) break;
    const idx = randomInt(0, pool.length);
    const userId = pool.splice(idx, 1)[0];
    selected.push({ user_id: userId, winner_type: winnerType, prize: PRIZES[winnerType], week_start: weekStartDateOnly });
  }

  const bestRating = [...ratings]
    .filter((r) => r.comment && r.comment.trim().length > 0)
    .sort((a, b) => (b.overall_stars ?? 0) - (a.overall_stars ?? 0))[0];

  if (bestRating && !selected.some((w) => w.user_id === bestRating.user_id)) {
    selected.push({
      user_id: bestRating.user_id,
      winner_type: 'quality',
      prize: PRIZES.quality,
      week_start: weekStartDateOnly,
    });
  }

  console.log('🏆 Gewinner-Vorschau:');
  selected.forEach((w) => {
    console.log(`   - ${w.winner_type}: ${w.user_id} (${w.prize})`);
  });

  if (dryRun) {
    console.log('✅ Dry-run abgeschlossen (keine DB-Änderungen).');
    return;
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Für Schreibzugriff wird SUPABASE_SERVICE_ROLE_KEY benötigt.');
  }

  const { error: insertError } = await supabase.from('winners').insert(
    selected.map((w) => ({
      ...w,
      is_anonymous: false,
      reward_claimed: false,
      reward_qr_code: null,
    }))
  );

  if (insertError) {
    throw new Error(`Fehler beim Speichern der Gewinner: ${insertError.message}`);
  }

  console.log('✅ Gewinner erfolgreich gespeichert.');
}

run().catch((err) => {
  console.error(`❌ ${err.message}`);
  process.exit(1);
});
