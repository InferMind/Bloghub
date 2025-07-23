# Database Scripts

This directory contains SQL scripts for setting up and updating the database schema.

## Initial Setup

Run `database-schema.sql` to create the initial database schema.

## Updates

### Adding published_at to posts table

Run `add-published-at.sql` to:
- Add the `published_at` column to the posts table
- Update existing published posts to have a published_at date
- Create a trigger to automatically set published_at when a post is published

### Updating likes table for comment likes

Run `update-likes-table.sql` to:
- Update the likes table to support both post and comment likes
- Add necessary constraints to ensure data integrity
- Fix the relationship between comments and likes

## Running the Scripts

Execute these scripts in your Supabase SQL editor or using the Supabase CLI.