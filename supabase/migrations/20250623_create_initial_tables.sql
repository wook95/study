-- 스터디 테이블
CREATE TABLE IF NOT EXISTS studies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    daily_goal_hours INTEGER DEFAULT NULL,
    category VARCHAR(100) DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- 제약 조건
    CONSTRAINT valid_date_range CHECK (end_date >= start_date),
    CONSTRAINT positive_goal_hours CHECK (daily_goal_hours IS NULL OR daily_goal_hours > 0)
);

-- 일일 기록 테이블
CREATE TABLE IF NOT EXISTS daily_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    study_id UUID NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    notes TEXT DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- 중복 방지: 하나의 스터디에 대해 하루에 하나의 기록만
    UNIQUE(study_id, date)
);

-- 투두 테이블
CREATE TABLE IF NOT EXISTS todos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    study_id UUID NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    content VARCHAR(500) NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_daily_records_study_date ON daily_records(study_id, date);
CREATE INDEX IF NOT EXISTS idx_todos_study_date ON todos(study_id, date);
CREATE INDEX IF NOT EXISTS idx_todos_is_completed ON todos(is_completed);

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- updated_at 트리거 생성
CREATE TRIGGER update_studies_updated_at BEFORE UPDATE ON studies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_records_updated_at BEFORE UPDATE ON daily_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_todos_updated_at BEFORE UPDATE ON todos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 샘플 데이터 삽입 (개발용)
INSERT INTO studies (name, start_date, end_date, daily_goal_hours, category) VALUES
('토익 공부', '2025-01-01', '2025-03-31', 2, '어학'),
('리액트 마스터하기', '2025-01-15', '2025-04-15', 3, '코딩')
ON CONFLICT DO NOTHING;

-- 첫 번째 스터디에 대한 샘플 투두 삽입
WITH first_study AS (
    SELECT id FROM studies WHERE name = '토익 공부' LIMIT 1
)
INSERT INTO todos (study_id, date, content) 
SELECT 
    first_study.id,
    CURRENT_DATE,
    unnest(ARRAY[
        '단어 50개 암기하기',
        'LC Part 1-2 문제 풀기',
        '문법 정리 노트 작성'
    ])
FROM first_study
ON CONFLICT DO NOTHING; 