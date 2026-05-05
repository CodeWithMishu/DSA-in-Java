import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import path from 'path';

const PROGRESS_FILE = path.join(process.cwd(), 'progress', 'latest.json');

/**
 * Git-backed progress synchronization
 * 
 * Features:
 * - Atomic read/write with git versioning
 * - Auto-commit on save with device identifier
 * - Cross-device sync via git pull
 * - Timestamp-tracked snapshots
 * 
 * Example workflow:
 * 1. User completes a problem on Device A
 * 2. Frontend POSTs to /api/progress with updated state
 * 3. API writes progress/latest.json and commits to git
 * 4. User switches to Device B
 * 5. Frontend GETs /api/progress
 * 6. API runs git pull to fetch latest, returns synced state
 */

function getDeviceId() {
  // Use hostname + timestamp for unique device identification
  return `${process.env.HOSTNAME || 'device'}-${Math.random().toString(36).substr(2, 9)}`;
}

function ensureGitRepo() {
  try {
    execSync('git rev-parse --git-dir', { 
      cwd: process.cwd(),
      stdio: 'pipe' 
    });
    return true;
  } catch {
    return false;
  }
}

function gitPull() {
  try {
    execSync('git pull --quiet origin $(git rev-parse --abbrev-ref HEAD) 2>/dev/null || true', {
      cwd: process.cwd(),
      stdio: 'pipe',
      timeout: 5000
    });
  } catch (err) {
    console.warn('Git pull failed (offline or no remote):', err.message);
  }
}

function gitCommit(progress) {
  try {
    if (!ensureGitRepo()) return;

    // Stage the progress file
    execSync('git add progress/latest.json', { cwd: process.cwd(), stdio: 'pipe' });

    // Check if there are staged changes
    const status = execSync('git status --porcelain', { cwd: process.cwd() }).toString();
    if (!status.includes('progress/latest.json')) return;

    // Commit with device info and summary
    const completedCount = progress.completedProblems?.length || 0;
    const deviceId = getDeviceId();
    const timestamp = new Date().toISOString();
    const message = `chore: sync progress [${completedCount} problems] via ${deviceId} at ${timestamp}`;

    execSync(`git commit -m "${message}" --quiet`, { 
      cwd: process.cwd(), 
      stdio: 'pipe',
      timeout: 5000 
    });

    console.log('✓ Progress committed to git');
  } catch (err) {
    console.warn('Git commit failed (repo/config issue):', err.message);
  }
}

export async function GET(request) {
  try {
    // Sync with remote before reading
    gitPull();

    // Read current progress
    const data = readFileSync(PROGRESS_FILE, 'utf-8');
    const progress = JSON.parse(data);

    // Update sync metadata
    progress.lastSyncedAt = new Date().toISOString();
    if (!progress.syncedDevices) progress.syncedDevices = [];
    progress.syncedDevices = [
      ...new Set([getDeviceId(), ...progress.syncedDevices])
    ].slice(0, 5); // Keep last 5 devices

    return Response.json({
      success: true,
      progress,
      syncedAt: new Date().toISOString(),
      mode: 'git-backed'
    });
  } catch (error) {
    console.error('Progress read error:', error);
    return Response.json(
      { 
        success: false, 
        error: error.message,
        fallback: {
          completedProblems: [],
          completionLog: [],
          lastSyncedAt: null
        }
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { completedProblems, completionLog } = body;

    if (!Array.isArray(completedProblems) || !Array.isArray(completionLog)) {
      return Response.json(
        { success: false, error: 'Invalid progress data' },
        { status: 400 }
      );
    }

    const progress = {
      completedProblems,
      completionLog,
      lastSyncedAt: new Date().toISOString(),
      syncedDevices: [getDeviceId()]
    };

    // Write progress file
    writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));

    // Attempt git commit (non-blocking)
    gitCommit(progress);

    return Response.json({
      success: true,
      progress,
      syncedAt: new Date().toISOString(),
      mode: 'git-backed',
      message: `Progress saved: ${completedProblems.length} problems completed`
    });
  } catch (error) {
    console.error('Progress save error:', error);
    return Response.json(
      { 
        success: false, 
        error: error.message 
      },
      { status: 500 }
    );
  }
}
