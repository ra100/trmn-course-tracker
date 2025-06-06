# Contributing to TRMN Course Tracker

Thank you for your interest in contributing to the TRMN Course Tracker!
We welcome bug reports, feature requests, code improvements, and new course data.

---

## 🚦 Commit Message Guidelines

We use a **gitmoji + reason** commit style, following the [Chris Beams rules](https://cbea.ms/git-commit/) and the `.cursor/commit-message-pattern.mdc` in this repo.

**Format:**

```
<gitmoji> <subject line in imperative mood, max 50 chars>

[optional body, wrap at 72 chars]
[optional footer]
```

**Rules:**

- Start with an appropriate gitmoji (see below)
- Separate subject from body with a blank line
- Limit the subject line to 50 characters
- Capitalize the first word in the subject
- Do not end the subject line with a period
- Use the imperative mood in the subject (e.g., "Add", not "Added")
- Wrap the body at 72 characters
- Use the body to explain what and why, not how

**Common Gitmojis:**

- ✨ New feature (`feat`)
- 🐛 Bug fix (`fix`)
- 📝 Docs (`docs`)
- ♻️ Refactor (`refactor`)
- 🎨 Style/formatting (`style`)
- ✅ Tests (`test`)
- 🚀 Deploy
- 🧱 Infrastructure
- 🔧 Config
- 🔒 Security
- 🚚 Move/rename
- 👷 CI/CD
- 🔊 Logs
- ⬆️ Upgrade deps
- ⬇️ Downgrade deps
- 🔥 Remove code/files
- 💄 UI/style
- 🎉 Initial commit

**Examples:**

```
✨ Add alternative prerequisites parsing
🐛 Fix locked course color for Warrant courses
📝 Update documentation for new course format
♻️ Refactor eligibility engine for clarity

🔧 Update Vite config for GitHub Pages base path

✨ Add new BuTran courses
```

**Tip:**
For complex changes, add a detailed explanation in the commit body after a blank line.

---

## 🗂️ How to Add More Courses

1. **Edit the Course Data File**

   - All course data is stored in the markdown file:
     **`public/Courses.md`**
   - Each course should follow the existing markdown structure.

2. **Course Format Example**

   ```markdown
   ## Section Name

   ### Subsection Name

   **COURSE-CODE**: Course Name

   - **Prerequisites**: PREV-COURSE-001, PREV-COURSE-002
   - **Level**: A
   ```

   - **Section**: Use `##` for the main section (e.g., "Engineering")
   - **Subsection**: Use `###` for a group within a section (e.g., "Propulsion")
   - **Course**: Use `**CODE**: Name` and list prerequisites and level as shown.

3. **Alternative Prerequisites**

   - Use `or` for alternatives:
     `- **Prerequisites**: SIA-RMN-0005 or GPU-ALC-0009`

4. **Warrant/Project Courses**

   - If a course is a project or warrant, use the same format, and the parser will handle it.

5. **Check Your Changes**

   - Run the app locally (`npm run dev`) and verify your new courses appear and are parsed correctly.
   - Run tests: `npm run test:run`

6. **Submit a Pull Request**
   - Fork the repo and create a new branch:
     `git checkout -b feat/add-new-courses`
   - Commit your changes using the commit style above.
   - Push and open a Pull Request on GitHub.

---

## 🧪 Running Locally

```sh
npm install
npm run dev
```

## 🧪 Running Tests

```sh
npm run test:run
```

---

## 💬 Need Help?

Open an issue or start a discussion on GitHub if you have questions!

---

Thank you for helping make TRMN Course Tracker better!
