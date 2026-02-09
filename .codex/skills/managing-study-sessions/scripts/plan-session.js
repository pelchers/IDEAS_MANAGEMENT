#!/usr/bin/env node
/**
 * Study Session Planner
 * Creates Pomodoro-based study session plan
 * Usage: node plan-session.js topic.json session-plan.md --duration 120
 */

const fs = require('fs');

function generatePomodoroSchedule(tasks, durationMinutes) {
  const pomodoroLength = 25;
  const shortBreak = 5;
  const longBreak = 15;

  const totalPomodoros = Math.floor(durationMinutes / (pomodoroLength + shortBreak));
  const schedule = [];

  let currentTime = 0;
  let taskIndex = 0;

  for (let i = 0; i < totalPomodoros; i++) {
    const task = tasks[taskIndex % tasks.length];

    schedule.push({
      type: 'pomodoro',
      number: i + 1,
      startTime: currentTime,
      endTime: currentTime + pomodoroLength,
      task: task.name
    });

    currentTime += pomodoroLength;

    // Add break
    const isLongBreak = (i + 1) % 4 === 0 && i + 1 < totalPomodoros;
    const breakDuration = isLongBreak ? longBreak : shortBreak;

    schedule.push({
      type: isLongBreak ? 'long_break' : 'short_break',
      startTime: currentTime,
      endTime: currentTime + breakDuration,
      duration: breakDuration
    });

    currentTime += breakDuration;
    taskIndex++;
  }

  return schedule;
}

function formatSessionPlan(schedule, startTime = '9:00') {
  let plan = '# Study Session Plan\n\n';
  plan += `**Start Time**: ${startTime}\n`;
  plan += `**Total Pomodoros**: ${schedule.filter(s => s.type === 'pomodoro').length}\n\n`;

  schedule.forEach(item => {
    if (item.type === 'pomodoro') {
      plan += `## Pomodoro ${item.number} (${formatTime(item.startTime)}-${formatTime(item.endTime)})\n`;
      plan += `**Task**: ${item.task}\n`;
      plan += `**Focus Time**: 25 minutes\n\n`;
    } else {
      plan += `**Break** (${formatTime(item.startTime)}-${formatTime(item.endTime)}): ${item.duration} minutes\n\n`;
    }
  });

  return plan;
}

function formatTime(minutes) {
  const hour = Math.floor(minutes / 60) + 9; // Start at 9:00
  const min = minutes % 60;
  return `${hour}:${min.toString().padStart(2, '0')}`;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error('Usage: node plan-session.js <topic.json> <session-plan.md> [--duration 120]');
    process.exit(1);
  }

  const [inputPath, outputPath] = args;
  const duration = args.includes('--duration') ? parseInt(args[args.indexOf('--duration') + 1]) : 120;

  const data = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
  const tasks = data.tasks || [{ name: 'Study session' }];

  console.log(`📅 Planning ${duration}-minute study session...`);
  const schedule = generatePomodoroSchedule(tasks, duration);
  const plan = formatSessionPlan(schedule);

  fs.writeFileSync(outputPath, plan);
  console.log(`✅ Session plan created: ${outputPath}`);
}

if (require.main === module) {
  main().catch(console.error);
}

