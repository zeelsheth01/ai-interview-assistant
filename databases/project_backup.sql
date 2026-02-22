--
-- PostgreSQL database dump
--

\restrict vYSzyMaCoY2KuvkQR3ixRjIcdamZZvP3d6tXzdjSpLl6DhimceAJLEDzsLiN4Rq

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: interview_questions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.interview_questions (
    id integer NOT NULL,
    resume_id integer,
    question text,
    difficulty character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.interview_questions OWNER TO postgres;

--
-- Name: interview_questions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.interview_questions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.interview_questions_id_seq OWNER TO postgres;

--
-- Name: interview_questions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.interview_questions_id_seq OWNED BY public.interview_questions.id;


--
-- Name: resumes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.resumes (
    id integer NOT NULL,
    user_id integer,
    file_path text NOT NULL,
    result_json jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.resumes OWNER TO postgres;

--
-- Name: resumes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.resumes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.resumes_id_seq OWNER TO postgres;

--
-- Name: resumes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.resumes_id_seq OWNED BY public.resumes.id;


--
-- Name: skills; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.skills (
    id integer NOT NULL,
    resume_id integer,
    skill_name character varying(100),
    confidence_score double precision
);


ALTER TABLE public.skills OWNER TO postgres;

--
-- Name: skills_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.skills_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.skills_id_seq OWNER TO postgres;

--
-- Name: skills_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.skills_id_seq OWNED BY public.skills.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: interview_questions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interview_questions ALTER COLUMN id SET DEFAULT nextval('public.interview_questions_id_seq'::regclass);


--
-- Name: resumes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resumes ALTER COLUMN id SET DEFAULT nextval('public.resumes_id_seq'::regclass);


--
-- Name: skills id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.skills ALTER COLUMN id SET DEFAULT nextval('public.skills_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: interview_questions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.interview_questions (id, resume_id, question, difficulty, created_at) FROM stdin;
\.


--
-- Data for Name: resumes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.resumes (id, user_id, file_path, result_json, created_at) FROM stdin;
\.


--
-- Data for Name: skills; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.skills (id, resume_id, skill_name, confidence_score) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, password, created_at) FROM stdin;
1	test@gmail.com	$2b$12$IvMAguWy99m5NGGOKZuvoOQCaB2e2sUSlqpjM8ZUB0HP6qX1fARqK	2026-02-17 10:26:08.920417
3	zeelsheth1@gmail.com	$2b$12$Q0klgh7bkxIdfv3sdk.DKuhwIBEf9b5ihF0t4Ohn9nYvXQRKWEmOG	2026-02-17 11:13:56.398162
4	demo@gmail.com	$2b$12$sDIdk8v6qdophQNiatrhZOOmjlWgqD7ENWofY1rtVPmahTi0fVMGK	2026-02-17 11:23:08.858292
5	testing@gmail.com	$2b$12$O3riDXvDYHjqeTZ3MzchY.BVzErWwjlvMOL5IGxCt//D80v/3z9RO	2026-02-17 11:54:24.277645
6	demo1	$2b$12$Qg6wmjBm630jx32vrwClGuVe4QD7oag0TS8mSKJA0mvx8ZW/xP2T6	2026-02-17 22:44:51.357374
12	test1@gmail.com	$2b$12$itn3nokUmnmT/6B0KJ.BXO7GkBFyk8XIeHR6Vx95mQJW8mdJhV49q	2026-02-18 10:40:02.013963
13	test2@gmail.com	$2b$12$M5EAhalKW.F5yIX58m/zbOivKlX7J0BFQII.bAAAzRCJno/9/cnQ2	2026-02-18 10:44:59.089446
15	demo1@gmail.com	$2b$12$Cn1RaCq5Vr6o2pXmxx9smeLknRZ.lz6Kd0vtVwxehLeelXIq5BGIO	2026-02-18 10:45:02.765528
25	demo2@gmail.com	$2b$12$UdgSfWjPpMrDZRLsvv02m.9VkfQxgVT/lf6AfAp29gycN5Z2MJnpu	2026-02-18 10:49:09.903542
27	demo3@gmail.com	$2b$12$yfJ3Nq4cvvhIdR8CsnXxtOkYB9ztQ/hKaM0PBrn342mEsEKm0xCaO	2026-02-18 11:11:39.446743
28	demo4@gmail.com	$2b$12$Y9ilLHsOk6EFMAqhYmrJHe4M8d.YMLFjXkMP/lZS9an5WI2zwp07m	2026-02-18 11:15:43.046745
29	demo5@gmail.com	$2b$12$bDEabFn/RVUD6OU6ZKTW/eZZXZVrExJAvV/Q7dWduNoVHblmX47Mu	2026-02-18 11:19:24.09732
32	zeelsheth22@gmail.com	$2b$12$h1zqafI/dXh2JSTc18WU6uckHhY30M5aMnP2VIJBdTQpOyU0.x6o2	2026-02-18 11:32:03.639815
34	test10@gmail.com	$2b$12$qTBxSNGofRwnXYi.19uIzOI/ji8Jls/aJrRdDU2OVXbYLvVz2X/Pu	2026-02-19 09:09:49.250958
35	hiten@gmail.com	hiten	2026-02-21 08:53:21.790095
36	testing2006@gmail.com	testing2006	2026-02-22 16:17:23.976621
\.


--
-- Name: interview_questions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.interview_questions_id_seq', 1, false);


--
-- Name: resumes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.resumes_id_seq', 1, false);


--
-- Name: skills_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.skills_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 36, true);


--
-- Name: interview_questions interview_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interview_questions
    ADD CONSTRAINT interview_questions_pkey PRIMARY KEY (id);


--
-- Name: resumes resumes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resumes
    ADD CONSTRAINT resumes_pkey PRIMARY KEY (id);


--
-- Name: skills skills_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.skills
    ADD CONSTRAINT skills_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: interview_questions interview_questions_resume_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interview_questions
    ADD CONSTRAINT interview_questions_resume_id_fkey FOREIGN KEY (resume_id) REFERENCES public.resumes(id) ON DELETE CASCADE;


--
-- Name: resumes resumes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resumes
    ADD CONSTRAINT resumes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: skills skills_resume_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.skills
    ADD CONSTRAINT skills_resume_id_fkey FOREIGN KEY (resume_id) REFERENCES public.resumes(id) ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict vYSzyMaCoY2KuvkQR3ixRjIcdamZZvP3d6tXzdjSpLl6DhimceAJLEDzsLiN4Rq

