# Student Task Manager (ElectronJS)

A small desktop app for keeping study tasks organized.

## Features
- Add a task (up to 100 characters).
- Mark a task as completed or unfinished.
- Delete a task.
- See the number of remaining and total tasks.
- Save tasks locally so they remain after restarting the app.
- Recover safely from malformed or damaged saved task data.
- Keep working during the current session if local storage is unavailable.

## Requirements
- Node.js 22.12.0 or newer and npm.
- Internet connection for the first installation (to download Electron).

## Run the project
1. Extract this ZIP file.
2. Open the extracted `Student-Task-Manager` folder in VS Code or a terminal.
3. Run `npm install`.
4. Run `npm start`.

## Run the automated tests
Run `npm test` in the project folder. The tests check task validation, malformed saved data, duplicate IDs, task limits, and task counters.

## Main files
- `main.js`: starts Electron and creates a restricted desktop window.
- `index.html`: contains the page structure and Content Security Policy.
- `style.css`: controls the responsive design and keyboard-focus styles.
- `renderer.js`: handles the form, task list, and local storage.
- `task-core.js`: validates task data and contains shared task helpers.
- `test/task-core.test.js`: automated tests for the task helpers.

## Security and data notes
- Renderer Node.js integration is disabled; context isolation and Chromium sandboxing are enabled.
- The app blocks pop-up windows, page navigation, and browser permission requests.
- A Content Security Policy limits where scripts, styles, and other resources can load from.
- Task data is stored locally in this app's Electron profile. It is not synced to the cloud, so keep a separate backup if the tasks are important.
- If the saved task data is invalid JSON, the app attempts to keep a backup under `studentTasks.corruptBackup` before starting with an empty list.

## Before submitting
1. Run `npm test` and confirm all tests pass.
2. Run `npm start`.
3. Add a few sample tasks, mark one complete, delete another, then close and reopen the app to verify persistence.
4. Take your own screenshots of the running app and important code sections for your report.
5. Make sure you can explain each feature and the security settings in your own words.

## Build a Windows EXE installer

The project includes an `electron-builder` NSIS installer configuration and a portable EXE target. Build artifacts are written to `dist/`.

### Requirements
- Windows 10/11 (64-bit) is recommended for a local Windows build.
- Node.js 22.12.0 or newer and npm.
- Internet connection for downloading build dependencies the first time.

### Create the installer
1. Extract the project and open the `Student-Task-Manager` folder in PowerShell or Windows Terminal.
2. Run `npm install`.
3. Run `npm test` and confirm all tests pass.
4. Run `npm run build:win`.
5. Find the setup program in `dist/`, named similar to `Student-Task-Manager-1.2.0-x64.exe`.

The installer is an assisted per-user installer: it allows choosing an installation folder, creates Start Menu and Desktop shortcuts, and can launch the app after setup. Uninstalling the app does not intentionally delete its saved task data.

### Create both EXE options
- `npm run build:win` — standard Windows setup installer.
- `npm run build:win:portable` — portable EXE; no installation wizard.
- `npm run build:win:all` — builds both.
- `npm run pack:win` — creates an unpacked app directory for inspection.

### Build on GitHub Actions
A workflow is included at `.github/workflows/build-windows.yml`. Push the project to a GitHub repository, then open **Actions → Build Windows installers → Run workflow**. The workflow runs the tests, builds both EXE files on a Windows runner, and uploads them as an artifact named `student-task-manager-windows`. A tag beginning with `v` also triggers the workflow.

### Important distribution notes
- The generated installer is not code-signed. Windows SmartScreen or antivirus software may show an unknown-publisher warning. For public distribution, obtain a code-signing certificate and configure signing securely; never commit certificate files or passwords to the repository.
- The EXE build itself must be run on Windows or by the included Windows GitHub Actions workflow. This ZIP was prepared and its configuration was checked here, but a Windows EXE was not produced in this Linux environment.
- Electron and builder versions are declared in `package.json`; `npm install` creates the local dependency installation and lockfile.


## Quick Windows build (recommended)

On a Windows 10/11 64-bit PC:
1. Install Node.js 22.12 or newer.
2. Extract this ZIP.
3. Open the `Student-Task-Manager` folder.
4. Right-click `Build-Windows-Installer.ps1` and choose **Run with PowerShell**.
   If Windows blocks the script, open PowerShell in this folder and run:
   `powershell -ExecutionPolicy Bypass -File .\Build-Windows-Installer.ps1`
5. When it finishes, open `dist` and run
   `Student-Task-Manager-1.2.0-x64.exe`.

The script installs dependencies, runs all tests, and builds both the normal installer and portable EXE.
The GitHub Actions workflow can also build these files on a Windows runner. Upload this project to a
GitHub repository, then choose **Actions → Build Windows installers → Run workflow** and download
the `student-task-manager-windows` artifact after the run succeeds.

**Build status:** The six included automated tests pass. This source bundle has not itself been
compiled into a Windows `.exe` in this environment. A Windows build (locally or through GitHub Actions)
is still required to produce the installer.
