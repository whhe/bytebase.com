---
title: Database Change Management with Spanner and GitHub
author: Ningjing
published_at: 2023/05/25 16:15
feature_image: /content/docs/tutorials/database-change-management-with-spanner-and-github/feature-image.webp
tags: Tutorial
integrations: MySQL, GitHub
level: Intermediate
description: This tutorial will bring your Spanner schema change to the next level by introducing the GitOps workflow, where you commit schema change script to the GitHub repository, which will in turn trigger the schema deployment pipeline in Bytebase.
---

This is a series of articles about Database Change Management with Spanner, and is also applicable to Spanner Serverless.

- [Database Change Management with Spanner](/docs/tutorials/database-change-management-with-spanner)
- Database Change Management with Spanner and GitHub (this one)

---

In the last article [Database Change Management with Spanner](/docs/tutorials/database-change-management-with-spanner), you have tried **UI workflow** in Bytebase.

This tutorial will bring your Spanner schema change to the next level by introducing the **GitOps workflow**, where you commit the schema change script to the GitHub repository, which will in turn trigger the schema deployment pipeline in Bytebase.

You can use Bytebase free version to finish the tutorial.

## Features included

- GitOps Workflow

## Prerequisites

Before you start this tutorial, make sure you have the following ready:

- Followed our previous UI-based change tutorial [Database Change Management with Spanner](/docs/tutorials/database-change-management-with-spanner).
- A Cloud Spanner instance.
- A GitHub account.
- A public GitHub repository, e.g  `bb-test-gitops-spanner`.
- [Docker](https://www.docker.com/) installed locally.
- An [ngrok](http://ngrok.com/) account (ngrok is a reverse proxy tunnel, and in our case, we need it for a public network address in order to receive webhooks from GitHub. We use ngrok here for demonstration purposes. For production use, we recommend using [Caddy](https://caddyserver.com/)).

![ngrok](/content/docs/tutorials/database-change-management-with-spanner-and-github/ngrok.webp)

## Step 1 - Run Bytebase in Docker with URL generated by ngrok

To make local-running Bytebase visible to GitHub, we’ll pass the URL generated by ngrok to [--external-url](/docs/get-started/install/external-url).

1. Login to [ngrok Dashboard](https://dashboard.ngrok.com/) and follow its [Getting Started](https://dashboard.ngrok.com/get-started/setup) steps to install and configure.

2. Run

```bash
ngrok http 5678
```

and obtain the public URL:
![terminal-ngrok](/content/docs/tutorials/database-change-management-with-spanner-and-github/terminal-ngrok.webp)

3. Make sure your Docker daemon is running, if it’s running Bytebase container for [the previous tutorial](/docs/tutorials/database-change-management-with-spanner), there're two ways:

- 1a. Go to **Settings** > **Workspace** > **General**, fill in the **External URL** field and click **Update**.
- 1b. Stop and remove it. The data created in the last tutorial is stored under `~/.bytebase/data` by default and will be restored if the system restarts. Start the Bytebase Docker container by typing the following command in the terminal. Pay attention to the last parameter `--external-url https://1681-149-129-123-75.ngrok-free.app`, which is generated by ngrok.

```bash
docker run --init \
--name bytebase \
--platform linux/amd64 \
--restart always \
--publish 5678:8080 \
--health-cmd "curl --fail http://localhost:5678/healthz || exit 1" \
--health-interval 5m \
--health-timeout 60s \
--volume ~/.bytebase/data:/var/opt/bytebase \
bytebase/bytebase:%%bb_version%% \
--data /var/opt/bytebase \
--port 8080 \
--external-url https://1681-149-129-123-75.ngrok-free.app
```

## Step 2 - Find your Spanner in Bytebase

1. Visit Bytebase Console through the browser via your ngrok URL `https://1681-149-129-123-75.ngrok-free.app`. Log in using your account created from the previous tutorial.

2. If you followed the previous tutorial, you should see that the project and database created are still in your workspace.

## Step 3 - Connect Bytebase with GitHub.com

1. Click **Settings** on the top bar, and then click **Workspace** > **GitOps**. Choose **GitHub.com** and click **Next**.

2. Follow the instructions within **STEP 2**, and in this tutorial, we will use a personal account instead of an organization account. The configuration is similar.

3. Go to your GitHub account. Click your avatar on the top right, and then click **Settings** on the dropdown menu.

4. Click **Developer Settings** at the bottom of the left sidebar. Click **OAuth Apps**, and add a **New OAuth App**.
5. Fill **Application name** and then copy the **Homepage** and **Authorization callback URL** in Bytebase and fill them. Click **Register application**.

6. After the OAuth application is created, click **Generate a new client secret**.

7. Go back to Bytebase. Copy the **Client ID** and the newly generated **Client Secret**, paste them back into Bytebase's **Application ID** and **Secret**.

![bb-settings-gitops-step2](/content/docs/tutorials/database-change-management-with-spanner-and-github/bb-settings-gitops-step2.webp)

8. Click **Next**. You will be redirected to the confirmation page. Click **Confirm and add**, and the Git provider is successfully added.

## Step 4 - Enable GitOps Workflow with Spanner

1. Click **Projects** on the top bar and click **New Project**. Name it `Demo GitOps` and click **Create**.
2. Go to the project `Demo GitOps` and click **Transfer in DB**. Choose `test_db` from project `Demo UI`.

3. Click **GitOps**, and choose **GitOps Workflow**. Click **Configure GitOps**.

4. Choose `GitHub.com` - the provider you just added. It will display all the repositories you can manipulate. Choose `bb-test-gitops-spanner`.

5. Keep the default setting, and click **Finish**.

## Step 5 - Change schema for Spanner by pushing SQL schema change files to GitHub

1. In your GitHub repository `bb-test-gitops-spanner`, create a folder `bytebase`, then create a subfolder `test`, and create a SQL file using the naming convention `{{ENV_ID}}/{{DB_NAME}}##{{VERSION}}##{{TYPE}}##{{DESCRIPTION}}.sql`. It is the default configuration for the file path template setting under project `Demo GitOps` > **GitOps**.

   `test/test_db##202305090000##dml##add_bella.sql`

   - `test` corresponds to `{{ENV_ID}}`
   - `test_db` corresponds to `{{DB_NAME}}`
   - `202305090000` corresponds to `{{VERSION}}`
   - `dml` corresponds to `{{TYPE}}`
   - `add_bella` corresponds to `{{DESCRIPTION}}`

   Paste the sql script in it.

   ```sql
   CREATE t1 (Id, Name) VALUES (2,'Bella');
   ```

2. Commit and push this file.

3. Go to Bytebase, and go into project `Demo GitOps`. You’ll find there is a new `Push Event` and a new `issue 107` created.
   ![bb-project-push-event](/content/docs/tutorials/database-change-management-with-spanner-and-github/bb-project-push-event.webp)

4. Click `issue/107` and go to the issue page. The issue is `Done`. You’ll see:

   - The issue is created via GitHub.com
   - The issue is executed without approval because it’s on `Test` environment where manual approval is skipped by default. The Assignee is `Bytebase`, because the execution is automatic, and requires no manual approval.
   - The SQL is exactly the one we have committed to the GitHub repository.
   - The Creator is `A`, because the GitHub user you use to commit the change has the same email address found in the Bytebase member list.
     ![bb-issue-done](/content/docs/tutorials/database-change-management-with-spanner-and-github/bb-issue-done.webp)

5. Click **View change**, you can view the schema diff.

## Summary and What's Next

Now that you have tried the **GitOps workflow**, which stores your Spanner schema in GitHub and triggers the change upon committing change to the repository, to bring your Spanner change workflow to the next level of Database DevOps - [Database as Code](/blog/database-as-code).

You can check out [GitOps docs](/docs/vcs-integration/overview) to learn more configuration details.

In the real world, you might have separated feature and main branches corresponding to your development and production environment, you can check out [GitOps with Feature Branch Workflow](/docs/how-to/workflow/gitops-feature-branch) to learn the setup. Have a try and look forward to your feedback!
