# Product Requirements Document

## Product Summary

A mobile app built with React Native and Expo that remotely connects to a user's PC via SSH and provides:

- an interactive terminal session suitable for Codex or Claude Code usage
- a browsable inventory of repositories found on the PC
- remote filesystem browsing from the `C:\` root
- list, table, and grid presentation modes for repository discovery

## Problem

Remote terminal apps are usually generic and weak at software-project workflows. They rarely understand repositories, often provide poor file navigation, and do not present coding-assistant sessions in a way that feels equitable to desktop usage.

## Users

- solo developers who need quick remote intervention from a phone
- technical users who want to inspect and manage repositories away from their desk
- power users who already use AI coding tools on their PC and want mobile control

## Goals

- Provide a reliable mobile control surface for remote coding workflows.
- Reduce friction between “connect to machine” and “start working in the right repo”.
- Support remote terminal interaction that is good enough for agent-driven coding sessions.
- Expose filesystem and repo inventory views that complement the terminal instead of replacing it.

## Core Features

### SSH-Based PC Connection

- pair a mobile client with a PC host over SSH
- support key-based authentication
- reconnect into recent sessions when possible

### Terminal Experience

- open an interactive terminal instance within the app
- preserve scrollback and active session state
- handle resize/orientation changes cleanly
- support copy, paste, and selection affordances suitable for phone screens

### Repository Discovery

- scan the PC for repositories using the same discovery principles as `C:\App\REPOSAVER`
- present results in list, table, and grid modes
- allow search, sort, and recent/favorite filtering

### Remote Filesystem View

- browse the PC filesystem starting at `C:\`
- inspect directories and files safely
- jump from a repo entry directly into its path

## Non-Goals

- full desktop IDE parity on mobile
- replacing the PC host with on-device local coding execution
- broad non-developer device management

## Success Criteria

- users can connect to their PC and start a coding-agent session from mobile without manual shell setup each time
- repo discovery is materially faster than hand-navigating the filesystem in a terminal
- terminal latency and session persistence are acceptable for short to medium remote work sessions
