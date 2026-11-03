-- 004: bind course PDFs (filenames in backend/storage/pdfs/) to their courses.
-- pdf_url now stores ONLY the file name; files are served through the
-- authenticated GET /api/v1/courses/{id}/pdf endpoint, never by direct URL.
UPDATE courses SET pdf_url = 'Facebook_Ads_Mastery_SkillLab.pdf' WHERE slug = 'facebook-ads-mastery';
UPDATE courses SET pdf_url = 'Instagram_Ads_Mastery_SkillLab.pdf' WHERE slug = 'instagram-ads-mastery';
UPDATE courses SET pdf_url = 'Learning_AI_Automation_SkillLab.pdf' WHERE slug = 'ai-automation';
UPDATE courses SET pdf_url = 'Learning_Cloud_AI_Agent_Generation_SkillLab.pdf' WHERE slug = 'cloud-ai-agent-generation';
UPDATE courses SET pdf_url = 'Flutter_AI_App_Development_Crash_Course.pdf' WHERE slug = 'flutter-ai-app-development';
