# AI Usage Report

## Project

PlantOps is a Next.js and Supabase application for tracking factory machines, alarms, and maintenance work.

## AI Assistance

An AI coding assistant was used to review the existing application, improve the login and dashboard experience, and align machine, alarm, and maintenance forms with the verified Supabase schema.

The assistant also helped diagnose the Supabase signup failure. It identified an incorrect project URL and reviewed the `auth.users` trigger. The trigger was updated to pin its `search_path`, use the fully qualified `public.user_role` type, and assign new accounts the Technician role by default.

## Human Review and Validation

The project owner approved the code and Supabase changes. The application passed `npm run lint` and `npm run build`. A database workflow smoke test created machine, alarm, and maintenance rows inside a transaction and rolled the transaction back; no test rows were retained.

The assistant did not use the owner's password or create a real account. The project owner remains responsible for reviewing the changes, testing sign-in and sign-up with their own account, and confirming any email-verification settings.