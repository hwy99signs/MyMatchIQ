-- QA-ONLY FIXTURE. DO NOT APPLY TO PRODUCTION.
-- This data tests persistence and the scoring engine. It is NOT the approved MyMatchIQ question bank or scoring model.

INSERT INTO mymatchiq.assessment_questions
  (assessment_version, question_key, tier_scope, position, prompt_i18n, answer_options, scoring_metadata, active)
SELECT
  'qa-mechanics-v1',
  'qa_q_' || g::text,
  'free',
  g,
  jsonb_build_object(
    'en', 'QA mechanics question ' || g::text,
    'es', 'Pregunta de mecánica QA ' || g::text,
    'fr', 'Question mécanique QA ' || g::text
  ),
  '[{"code":"A","label_i18n":{"en":"QA option A","es":"Opción QA A","fr":"Option QA A"}},{"code":"B","label_i18n":{"en":"QA option B","es":"Opción QA B","fr":"Option QA B"}},{"code":"C","label_i18n":{"en":"QA option C","es":"Opción QA C","fr":"Option QA C"}}]'::jsonb,
  jsonb_build_object(
    'weight', 1,
    'dimension', CASE WHEN g <= 5 THEN 'qa-values' WHEN g <= 10 THEN 'qa-lifestyle' ELSE 'qa-communication' END,
    'algorithm_version', 'qa-explicit-pairs-v1',
    'pair_scores', '{"A|A":1,"B|B":1,"C|C":1,"A|B":0.6,"B|A":0.6,"A|C":0.2,"C|A":0.2,"B|C":0.6,"C|B":0.6}'::jsonb
  ),
  true
FROM generate_series(1,15) g
ON CONFLICT (assessment_version, question_key) DO UPDATE SET
  prompt_i18n=excluded.prompt_i18n,
  answer_options=excluded.answer_options,
  scoring_metadata=excluded.scoring_metadata,
  active=true;
