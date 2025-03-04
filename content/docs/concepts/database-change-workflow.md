---
title: Database Change Workflow
---

There are 2 typical workflows employed by the team to deal with database schema changes (DDL) and data changes (DML). [UI workflow](#ui-workflow) and [GitOps workflow (GitOps)](#gitops-workflow).

## UI workflow

Classic SQL Review workflow where the developer submits a SQL review ticket directly from Bytebase and waits for the assigned DBA or peer developer to review. Bytebase applies the SQL change after review approved.

![workflow-ui](/content/docs/workflow-ui.png)

## GitOps Workflow

Aka `Database-as-Code`. Database migration scripts are stored in a git repository. To make schema changes, a developer would create a migration script and submit for review in the corresponding VCS such as GitLab. After the script is approved and merged into the configured branch, Bytebase will automatically kicks off the task to apply the new schema change.

![workflow-vcs](/content/docs/workflow-vcs.png)

## Migration Types

Bytebase records the migration history with the migration type information.

### Schema Migration

Schema migration is the migration type for DDL statements.

### Data Migration

Data migration is the migration type for DML statements.

### Baseline Migration

Baseline migration instructs Bytebase to use the latest live schema as the source of truth. This is normally used when [schema drift](/docs/change-database/drift-detection) occurs and Bytebase needs to re-establish the baseline based on the latest live schema.

### Branch Migration

A branch migration history is recorded when a database is restored from a backup. See [Restore from Backup](/docs/disaster-recovery/backup-restore-database/restore-from-backup#step-4-view-the-restored-database) for details.
