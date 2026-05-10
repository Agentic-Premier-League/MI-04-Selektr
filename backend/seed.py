import sys
import os
import random
import uuid

# Adjust path to find app module
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.db import SessionLocal, engine
from app.models import Base, Job, Candidate

def seed():
    Base.metadata.create_all(engine)
    session = SessionLocal()
    
    # Clear existing data so it seeds again on every run
    session.query(Candidate).delete()
    session.query(Job).delete()
    session.commit()


    job_roles = [
        {
            "title": "Senior Backend Engineer",
            "department": "Engineering",
            "location": "Remote",
            "employment_type": "Full-time",
            "experience_level": "Senior",
            "description": "We are seeking a deeply technical Senior Backend Engineer to architect and scale our microservices. You will be responsible for designing high-throughput, low-latency APIs, managing asynchronous message queues, and ensuring data consistency across distributed databases. The ideal candidate has strong expertise in Python, FastAPI, PostgreSQL, and Redis, with a proven track record of solving complex performance bottlenecks in production systems.",
            "required_skills": ["Python", "FastAPI", "PostgreSQL", "Redis", "Docker", "System Design"]
        },
        {
            "title": "Lead Product Manager",
            "department": "Product",
            "location": "New York, NY",
            "employment_type": "Full-time",
            "experience_level": "Director",
            "description": "We are looking for a Lead Product Manager to define the vision and roadmap for our core enterprise platform. You will work closely with engineering, design, and sales to identify market opportunities, prioritize features, and drive cross-functional execution. This role requires exceptional analytical skills, a deep understanding of B2B SaaS business models, and the ability to turn qualitative user feedback into measurable product improvements.",
            "required_skills": ["Agile", "Product Strategy", "User Research", "Data Analytics", "B2B SaaS"]
        },
        {
            "title": "Machine Learning Engineer",
            "department": "Data",
            "location": "Remote",
            "employment_type": "Full-time",
            "experience_level": "Mid-Level",
            "description": "Join our AI innovation lab as a Machine Learning Engineer to build cutting-edge natural language processing and computer vision models. You will be responsible for the end-to-end ML lifecycle: from data collection and cleaning, to model training, evaluation, and deployment using MLOps best practices. Experience with PyTorch or TensorFlow, as well as embedding models and vector databases, is highly desired.",
            "required_skills": ["Python", "PyTorch", "NLP", "Vector Databases", "MLOps"]
        },
        {
            "title": "Senior UX/UI Designer",
            "department": "Design",
            "location": "San Francisco, CA",
            "employment_type": "Full-time",
            "experience_level": "Senior",
            "description": "We are hiring a Senior UX/UI Designer to lead the redesign of our flagship mobile and web applications. You will create wireframes, interactive prototypes, and high-fidelity mockups that deliver intuitive and aesthetically stunning user experiences. Strong proficiency in Figma, a deep understanding of human-computer interaction principles, and experience building robust design systems are essential for this role.",
            "required_skills": ["Figma", "Prototyping", "Design Systems", "User Testing", "CSS"]
        }
    ]

    first_names = ["Alice", "Bob", "Charlie", "Diana", "Eve", "Frank", "Grace", "Heidi", "Ivan", "Judy", "Mallory", "Nina", "Oscar", "Paul", "Quinn"]
    last_names = ["Smith", "Johnson", "Williams", "Jones", "Brown", "Davis", "Miller", "Wilson", "Moore", "Taylor", "Anderson", "Thomas", "Jackson", "White", "Harris"]
    roles_current = ["Developer", "Manager", "Analyst", "Designer", "Engineer", "Consultant"]

    total_jobs_seeded = 0
    total_candidates_seeded = 0

    for role in job_roles:
        job_slug = f"{role['title'].lower().replace(' ', '-')}-{random.randint(1000, 9999)}"
        job = Job(
            id=str(uuid.uuid4()),
            slug=job_slug,
            title=role["title"],
            department=role["department"],
            location=role["location"],
            employment_type=role["employment_type"],
            experience_level=role["experience_level"],
            description=role["description"],
            required_skills=role["required_skills"],
            status="active"
        )
        session.add(job)
        session.flush()
        total_jobs_seeded += 1

        # Seed 5 to 10 candidates per job
        num_candidates = random.randint(5, 10)
        for i in range(num_candidates):
            fname = random.choice(first_names)
            lname = random.choice(last_names)
            name = f"{fname} {lname}"
            email = f"{fname.lower()}.{lname.lower()}{random.randint(100,999)}@example.com"
            
            candidate = Candidate(
                id=str(uuid.uuid4()),
                job_id=job.id,
                full_name=name,
                email=email,
                phone=f"555-{random.randint(100,999)}-{random.randint(1000,9999)}",
                years_experience=str(random.randint(1, 15)),
                current_role=f"Senior {random.choice(roles_current)}",
                education="B.S. Relevant Degree",
                resume_text=f"Professional Summary:\nDedicated and results-oriented professional with {random.randint(4, 15)} years of experience in the tech industry. Proven track record of delivering high-quality solutions and driving business growth.\n\nExperience:\n- Senior {random.choice(roles_current)} at TechCorp (2018-Present): Led cross-functional teams to deploy scalable systems, utilizing {', '.join(role['required_skills'][:3])}. Increased system efficiency by 40%.\n- {random.choice(roles_current)} at Innovate LLC (2014-2018): Developed core features and maintained legacy systems. Collaborated closely with stakeholders to define requirements.\n\nEducation:\n- B.S. in Computer Science or related field.\n\nSkills:\nHighly proficient in {', '.join(role['required_skills'])}. Additional skills include leadership, agile methodologies, and effective communication.",
                overall_score=random.randint(60, 98),
                skills_match=random.randint(60, 98),
                experience_relevance=random.randint(60, 98),
                education_fit=random.randint(60, 98),
                ai_summary=f"{name} is a highly competitive candidate for the {job.title} role. Their background strongly aligns with the core requirements, particularly their deep expertise in {role['required_skills'][0]} and {role['required_skills'][1]}. They have a proven history of scaling systems and collaborating across teams, making them a low-risk, high-reward hire.",
                status=random.choice(["new", "interviewing", "rejected", "hired"]),
                skills_detected=role["required_skills"] if random.random() > 0.4 else role["required_skills"][:2]
            )
            session.add(candidate)
            total_candidates_seeded += 1

    session.commit()
    print(f"Successfully seeded {total_jobs_seeded} jobs and {total_candidates_seeded} candidates.")

if __name__ == "__main__":
    seed()
