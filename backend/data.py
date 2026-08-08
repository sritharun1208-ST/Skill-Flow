"""Static career-intelligence catalog for Skill Flow.
Careers, required skills, learning paths, resources, opportunities, projects, badges.
"""

LEVEL_VALUE = {"beginner": 1, "intermediate": 2, "advanced": 3}
LEVEL_LABEL = {0: "None", 1: "Beginner", 2: "Intermediate", 3: "Advanced"}


def lvl(name):
    return LEVEL_VALUE.get(str(name).lower(), 0)


# ---------------------------------------------------------------------------
# CAREERS CATALOG
# ---------------------------------------------------------------------------
CAREERS = [
    {
        "id": "software-developer",
        "name": "Software Developer",
        "icon": "Code2",
        "description": "Design, build and maintain software applications. Focus on strong programming fundamentals, data structures and problem solving.",
        "technologies": ["Python", "Java", "Git", "SQL", "REST APIs", "Linux"],
        "typical_projects": ["Expense Tracker", "URL Shortener", "Chat Application", "Task Manager API"],
        "required_skills": [
            {"name": "Data Structures & Algorithms", "level": "intermediate", "core": True},
            {"name": "Python", "level": "advanced", "core": True},
            {"name": "Problem Solving", "level": "intermediate", "core": True},
            {"name": "SQL", "level": "intermediate", "core": False},
            {"name": "Git & GitHub", "level": "intermediate", "core": False},
            {"name": "REST APIs", "level": "intermediate", "core": True},
            {"name": "Backend Development", "level": "intermediate", "core": False},
            {"name": "Object Oriented Programming", "level": "intermediate", "core": False},
        ],
        "path": [
            {"title": "DSA Fundamentals", "why": "Every technical interview and real system relies on efficient data handling.", "difficulty": "Intermediate", "time": "4 weeks", "learn": ["Arrays", "Strings", "Linked Lists", "Stacks", "Queues"], "skill": "Data Structures & Algorithms", "project": "Implement a custom data structure library", "tasks": ["Solve 20 array problems", "Build a stack-based calculator"]},
            {"title": "Problem Solving", "why": "Turns knowledge into speed and confidence during assessments.", "difficulty": "Intermediate", "time": "5 weeks", "learn": ["Recursion", "Sorting", "Searching", "Two Pointers"], "skill": "Problem Solving", "project": "Solve a themed problem set", "tasks": ["Solve 50 coding problems", "Track patterns you struggle with"]},
            {"title": "Git & GitHub", "why": "Collaboration and version control are expected on day one of any job.", "difficulty": "Beginner", "time": "1 week", "learn": ["Commits", "Branches", "Pull Requests", "Merge Conflicts"], "skill": "Git & GitHub", "project": "Contribute to an open-source repo", "tasks": ["Create a branching workflow", "Open your first PR"]},
            {"title": "REST APIs", "why": "Modern apps communicate through APIs; this is the backbone of full stack work.", "difficulty": "Intermediate", "time": "3 weeks", "learn": ["HTTP Methods", "Status Codes", "Authentication", "CRUD"], "skill": "REST APIs", "project": "Build a notes REST API", "tasks": ["Design 5 endpoints", "Add JWT auth"]},
            {"title": "Backend Development", "why": "Ties everything together into deployable services.", "difficulty": "Advanced", "time": "5 weeks", "learn": ["Databases", "Caching", "Deployment", "Testing"], "skill": "Backend Development", "project": "Deploy a full backend service", "tasks": ["Add a database layer", "Write integration tests"]},
            {"title": "Real-World Project", "why": "Proof beats claims. A shipped project is your strongest signal.", "difficulty": "Advanced", "time": "4 weeks", "learn": ["System Design", "Deployment", "Documentation"], "skill": "Backend Development", "project": "Build and deploy a complete product", "tasks": ["Ship to production", "Write a case study"]},
        ],
    },
    {
        "id": "full-stack-developer",
        "name": "Full Stack Developer",
        "icon": "Layers",
        "description": "Build complete web applications across frontend and backend, from UI to database.",
        "technologies": ["React", "Node.js", "JavaScript", "MongoDB", "REST APIs", "Git"],
        "typical_projects": ["E-commerce Store", "Social Feed App", "Booking Platform"],
        "required_skills": [
            {"name": "JavaScript", "level": "advanced", "core": True},
            {"name": "React", "level": "advanced", "core": True},
            {"name": "HTML/CSS", "level": "advanced", "core": True},
            {"name": "Node.js", "level": "intermediate", "core": True},
            {"name": "REST APIs", "level": "intermediate", "core": True},
            {"name": "SQL", "level": "intermediate", "core": False},
            {"name": "Git & GitHub", "level": "intermediate", "core": False},
            {"name": "MongoDB", "level": "intermediate", "core": False},
        ],
        "path": [
            {"title": "HTML, CSS & Responsive Design", "why": "The visual foundation every web app is built on.", "difficulty": "Beginner", "time": "2 weeks", "learn": ["Flexbox", "Grid", "Responsive Layouts"], "skill": "HTML/CSS", "project": "Clone a landing page", "tasks": ["Build a responsive nav", "Recreate a pricing page"]},
            {"title": "JavaScript Mastery", "why": "The language that powers interactivity across the web.", "difficulty": "Intermediate", "time": "4 weeks", "learn": ["ES6", "Async/Await", "DOM", "Fetch"], "skill": "JavaScript", "project": "Build a weather dashboard", "tasks": ["Consume a public API", "Handle async errors"]},
            {"title": "React Fundamentals", "why": "The most in-demand frontend library for building UIs.", "difficulty": "Intermediate", "time": "4 weeks", "learn": ["Components", "Hooks", "State", "Routing"], "skill": "React", "project": "Build a task board", "tasks": ["Use useState & useEffect", "Add client routing"]},
            {"title": "Backend with Node.js", "why": "Serve data and business logic to your frontend.", "difficulty": "Intermediate", "time": "3 weeks", "learn": ["Express", "Routing", "Middleware", "Auth"], "skill": "Node.js", "project": "Build an auth API", "tasks": ["Add JWT login", "Protect routes"]},
            {"title": "Databases", "why": "Persist and query real application data.", "difficulty": "Intermediate", "time": "2 weeks", "learn": ["MongoDB", "Schemas", "Queries"], "skill": "MongoDB", "project": "Add a database to your API", "tasks": ["Model 3 collections", "Write aggregation queries"]},
            {"title": "Full Stack Project", "why": "Combine everything into a deployable product.", "difficulty": "Advanced", "time": "4 weeks", "learn": ["Deployment", "Environment Config", "CI"], "skill": "REST APIs", "project": "Ship a full MERN app", "tasks": ["Deploy frontend + backend", "Write a README"]},
        ],
    },
    {
        "id": "data-analyst",
        "name": "Data Analyst",
        "icon": "BarChart3",
        "description": "Turn raw data into insights using SQL, spreadsheets, Python and visualization tools.",
        "technologies": ["SQL", "Excel", "Python", "Power BI", "Tableau"],
        "typical_projects": ["Sales Dashboard", "Customer Churn Analysis", "COVID Data Report"],
        "required_skills": [
            {"name": "SQL", "level": "advanced", "core": True},
            {"name": "Excel", "level": "advanced", "core": True},
            {"name": "Python", "level": "intermediate", "core": True},
            {"name": "Data Visualization", "level": "intermediate", "core": True},
            {"name": "Power BI", "level": "intermediate", "core": False},
            {"name": "Statistics", "level": "intermediate", "core": True},
        ],
        "path": [
            {"title": "Excel & Spreadsheets", "why": "The universal first tool for any data work.", "difficulty": "Beginner", "time": "1 week", "learn": ["Formulas", "Pivot Tables", "Charts"], "skill": "Excel", "project": "Build a sales report", "tasks": ["Create 3 pivot tables"]},
            {"title": "SQL for Analysis", "why": "Query data directly from databases at scale.", "difficulty": "Intermediate", "time": "3 weeks", "learn": ["Joins", "Aggregations", "Window Functions"], "skill": "SQL", "project": "Analyze a retail database", "tasks": ["Write 20 queries"]},
            {"title": "Statistics", "why": "Understand what the numbers actually mean.", "difficulty": "Intermediate", "time": "3 weeks", "learn": ["Distributions", "Hypothesis Testing", "Correlation"], "skill": "Statistics", "project": "A/B test analysis", "tasks": ["Run a t-test"]},
            {"title": "Python for Data", "why": "Automate and scale your analysis.", "difficulty": "Intermediate", "time": "4 weeks", "learn": ["Pandas", "NumPy", "Matplotlib"], "skill": "Python", "project": "Clean a messy dataset", "tasks": ["Build a data pipeline"]},
            {"title": "Dashboards & Storytelling", "why": "Insights only matter if you can communicate them.", "difficulty": "Intermediate", "time": "2 weeks", "learn": ["Power BI", "Dashboards", "Data Storytelling"], "skill": "Data Visualization", "project": "Build an interactive dashboard", "tasks": ["Publish a Power BI report"]},
        ],
    },
    {
        "id": "data-scientist",
        "name": "Data Scientist",
        "icon": "Brain",
        "description": "Build predictive models and extract insights using statistics, ML and programming.",
        "technologies": ["Python", "Pandas", "Scikit-learn", "SQL", "Statistics"],
        "typical_projects": ["House Price Predictor", "Recommendation System", "Sentiment Analysis"],
        "required_skills": [
            {"name": "Python", "level": "advanced", "core": True},
            {"name": "Statistics", "level": "advanced", "core": True},
            {"name": "Machine Learning", "level": "intermediate", "core": True},
            {"name": "SQL", "level": "intermediate", "core": False},
            {"name": "Data Visualization", "level": "intermediate", "core": False},
            {"name": "Mathematics", "level": "intermediate", "core": True},
        ],
        "path": [
            {"title": "Python & Pandas", "why": "The core toolkit of every data scientist.", "difficulty": "Intermediate", "time": "3 weeks", "learn": ["Pandas", "NumPy", "Data Cleaning"], "skill": "Python", "project": "Exploratory data analysis", "tasks": ["Clean & explore a dataset"]},
            {"title": "Statistics & Math", "why": "The theory behind every model.", "difficulty": "Advanced", "time": "4 weeks", "learn": ["Probability", "Linear Algebra", "Inference"], "skill": "Statistics", "project": "Statistical report", "tasks": ["Run regression analysis"]},
            {"title": "Machine Learning", "why": "Move from describing data to predicting outcomes.", "difficulty": "Advanced", "time": "6 weeks", "learn": ["Regression", "Classification", "Model Evaluation"], "skill": "Machine Learning", "project": "Build a predictor", "tasks": ["Train & evaluate a model"]},
            {"title": "Capstone Project", "why": "Prove you can deliver end-to-end.", "difficulty": "Advanced", "time": "4 weeks", "learn": ["Feature Engineering", "Deployment"], "skill": "Machine Learning", "project": "Deploy an ML model", "tasks": ["Ship a model API"]},
        ],
    },
    {
        "id": "ai-ml-engineer",
        "name": "AI/ML Engineer",
        "icon": "Cpu",
        "description": "Design, train and deploy machine learning and deep learning systems in production.",
        "technologies": ["Python", "PyTorch", "TensorFlow", "MLOps", "Docker"],
        "typical_projects": ["Image Classifier", "Chatbot", "LLM App"],
        "required_skills": [
            {"name": "Python", "level": "advanced", "core": True},
            {"name": "Machine Learning", "level": "advanced", "core": True},
            {"name": "Deep Learning", "level": "intermediate", "core": True},
            {"name": "Mathematics", "level": "advanced", "core": True},
            {"name": "Data Structures & Algorithms", "level": "intermediate", "core": False},
            {"name": "MLOps", "level": "intermediate", "core": False},
        ],
        "path": [
            {"title": "Python & Math Foundations", "why": "The base every AI system is built on.", "difficulty": "Intermediate", "time": "3 weeks", "learn": ["Python", "Linear Algebra", "Calculus"], "skill": "Mathematics", "project": "Implement gradient descent", "tasks": ["Code a simple optimizer"]},
            {"title": "Machine Learning", "why": "Core algorithms before deep learning.", "difficulty": "Advanced", "time": "6 weeks", "learn": ["Supervised Learning", "Unsupervised Learning"], "skill": "Machine Learning", "project": "Build a classifier", "tasks": ["Train an SVM"]},
            {"title": "Deep Learning", "why": "Powers modern AI from vision to language.", "difficulty": "Advanced", "time": "6 weeks", "learn": ["Neural Nets", "CNNs", "Transformers"], "skill": "Deep Learning", "project": "Train an image classifier", "tasks": ["Build a CNN"]},
            {"title": "MLOps & Deployment", "why": "Models only add value in production.", "difficulty": "Advanced", "time": "3 weeks", "learn": ["Docker", "Model Serving", "Monitoring"], "skill": "MLOps", "project": "Deploy a model API", "tasks": ["Containerize a model"]},
        ],
    },
    {
        "id": "cybersecurity-analyst",
        "name": "Cybersecurity Analyst",
        "icon": "ShieldCheck",
        "description": "Protect systems and networks by identifying, analyzing and responding to threats.",
        "technologies": ["Linux", "Networking", "Python", "SIEM", "Kali"],
        "typical_projects": ["Vulnerability Scanner", "Network Monitor", "Phishing Detector"],
        "required_skills": [
            {"name": "Networking", "level": "advanced", "core": True},
            {"name": "Linux", "level": "advanced", "core": True},
            {"name": "Security Fundamentals", "level": "advanced", "core": True},
            {"name": "Python", "level": "intermediate", "core": False},
            {"name": "Cryptography", "level": "intermediate", "core": True},
        ],
        "path": [
            {"title": "Networking Basics", "why": "You can't secure what you don't understand.", "difficulty": "Intermediate", "time": "3 weeks", "learn": ["TCP/IP", "DNS", "Firewalls"], "skill": "Networking", "project": "Map a network", "tasks": ["Use Wireshark"]},
            {"title": "Linux & Command Line", "why": "The environment most security work happens in.", "difficulty": "Intermediate", "time": "2 weeks", "learn": ["Bash", "Permissions", "Processes"], "skill": "Linux", "project": "Harden a Linux box", "tasks": ["Write a hardening script"]},
            {"title": "Security Fundamentals", "why": "Core concepts of defense and attack.", "difficulty": "Advanced", "time": "4 weeks", "learn": ["OWASP", "Threat Modeling", "SIEM"], "skill": "Security Fundamentals", "project": "Run a vulnerability scan", "tasks": ["Report findings"]},
        ],
    },
    {
        "id": "cloud-engineer",
        "name": "Cloud Engineer",
        "icon": "Cloud",
        "description": "Design and manage scalable, reliable cloud infrastructure and services.",
        "technologies": ["AWS", "Docker", "Kubernetes", "Terraform", "Linux"],
        "typical_projects": ["Serverless API", "CI/CD Pipeline", "Auto-scaling App"],
        "required_skills": [
            {"name": "Linux", "level": "advanced", "core": True},
            {"name": "Cloud Platforms", "level": "advanced", "core": True},
            {"name": "Docker", "level": "intermediate", "core": True},
            {"name": "Networking", "level": "intermediate", "core": True},
            {"name": "CI/CD", "level": "intermediate", "core": False},
        ],
        "path": [
            {"title": "Linux & Networking", "why": "The foundation of all cloud infrastructure.", "difficulty": "Intermediate", "time": "3 weeks", "learn": ["Bash", "SSH", "Networking"], "skill": "Linux", "project": "Set up a Linux server", "tasks": ["Configure a firewall"]},
            {"title": "Cloud Platforms", "why": "AWS/Azure/GCP run the modern internet.", "difficulty": "Advanced", "time": "5 weeks", "learn": ["Compute", "Storage", "IAM"], "skill": "Cloud Platforms", "project": "Deploy a cloud app", "tasks": ["Launch an EC2 instance"]},
            {"title": "Containers & CI/CD", "why": "Ship reliably and repeatably.", "difficulty": "Advanced", "time": "4 weeks", "learn": ["Docker", "Kubernetes", "Pipelines"], "skill": "Docker", "project": "Build a CI/CD pipeline", "tasks": ["Containerize an app"]},
        ],
    },
    {
        "id": "ui-ux-designer",
        "name": "UI/UX Designer",
        "icon": "Palette",
        "description": "Design intuitive, beautiful and accessible digital product experiences.",
        "technologies": ["Figma", "Design Systems", "Prototyping", "User Research"],
        "typical_projects": ["Mobile App Redesign", "Design System", "Usability Study"],
        "required_skills": [
            {"name": "Figma", "level": "advanced", "core": True},
            {"name": "UI Design", "level": "advanced", "core": True},
            {"name": "UX Research", "level": "intermediate", "core": True},
            {"name": "Prototyping", "level": "intermediate", "core": True},
            {"name": "Design Systems", "level": "intermediate", "core": False},
        ],
        "path": [
            {"title": "Design Principles", "why": "Great design follows clear principles.", "difficulty": "Beginner", "time": "2 weeks", "learn": ["Typography", "Color", "Layout"], "skill": "UI Design", "project": "Redesign an app screen", "tasks": ["Create a style tile"]},
            {"title": "Figma Mastery", "why": "The industry-standard design tool.", "difficulty": "Intermediate", "time": "3 weeks", "learn": ["Components", "Auto Layout", "Variants"], "skill": "Figma", "project": "Build a UI kit", "tasks": ["Create a component library"]},
            {"title": "UX Research & Prototyping", "why": "Design for real users, not assumptions.", "difficulty": "Intermediate", "time": "3 weeks", "learn": ["User Interviews", "Wireframes", "Testing"], "skill": "UX Research", "project": "Run a usability test", "tasks": ["Interview 5 users"]},
        ],
    },
    {
        "id": "product-manager",
        "name": "Product Manager",
        "icon": "Compass",
        "description": "Guide products from idea to launch by balancing user needs, business and tech.",
        "technologies": ["Analytics", "Roadmapping", "SQL", "Agile"],
        "typical_projects": ["Product Requirement Doc", "Feature Launch Plan", "Market Analysis"],
        "required_skills": [
            {"name": "Product Strategy", "level": "advanced", "core": True},
            {"name": "Communication", "level": "advanced", "core": True},
            {"name": "Analytics", "level": "intermediate", "core": True},
            {"name": "SQL", "level": "beginner", "core": False},
            {"name": "UX Research", "level": "intermediate", "core": True},
        ],
        "path": [
            {"title": "Product Fundamentals", "why": "Understand what makes products succeed.", "difficulty": "Beginner", "time": "2 weeks", "learn": ["User Problems", "Value Props", "Metrics"], "skill": "Product Strategy", "project": "Write a PRD", "tasks": ["Define a feature spec"]},
            {"title": "Analytics & Data", "why": "PMs make decisions with data.", "difficulty": "Intermediate", "time": "3 weeks", "learn": ["Metrics", "Funnels", "SQL"], "skill": "Analytics", "project": "Build a metrics dashboard", "tasks": ["Define KPIs"]},
            {"title": "Communication & Leadership", "why": "PMs lead without authority.", "difficulty": "Intermediate", "time": "2 weeks", "learn": ["Stakeholders", "Roadmaps", "Prioritization"], "skill": "Communication", "project": "Present a roadmap", "tasks": ["Run a prioritization exercise"]},
        ],
    },
    {
        "id": "devops-engineer",
        "name": "DevOps Engineer",
        "icon": "GitMerge",
        "description": "Bridge development and operations to ship software faster and more reliably.",
        "technologies": ["Docker", "Kubernetes", "CI/CD", "Terraform", "Linux"],
        "typical_projects": ["CI/CD Pipeline", "Infrastructure as Code", "Monitoring Stack"],
        "required_skills": [
            {"name": "Linux", "level": "advanced", "core": True},
            {"name": "Docker", "level": "advanced", "core": True},
            {"name": "CI/CD", "level": "advanced", "core": True},
            {"name": "Cloud Platforms", "level": "intermediate", "core": True},
            {"name": "Scripting", "level": "intermediate", "core": False},
        ],
        "path": [
            {"title": "Linux & Scripting", "why": "Automation starts at the shell.", "difficulty": "Intermediate", "time": "3 weeks", "learn": ["Bash", "Cron", "Automation"], "skill": "Linux", "project": "Automate a deployment", "tasks": ["Write a deploy script"]},
            {"title": "Containers & Orchestration", "why": "The modern unit of deployment.", "difficulty": "Advanced", "time": "5 weeks", "learn": ["Docker", "Kubernetes", "Helm"], "skill": "Docker", "project": "Deploy to Kubernetes", "tasks": ["Write a Dockerfile"]},
            {"title": "CI/CD Pipelines", "why": "Ship safely, continuously.", "difficulty": "Advanced", "time": "4 weeks", "learn": ["GitHub Actions", "Pipelines", "Monitoring"], "skill": "CI/CD", "project": "Build a full pipeline", "tasks": ["Automate tests & deploy"]},
        ],
    },
]

CAREER_BY_ID = {c["id"]: c for c in CAREERS}


# ---------------------------------------------------------------------------
# RESOURCES  (keyed by skill name)
# ---------------------------------------------------------------------------
RESOURCES = {
    "Data Structures & Algorithms": [
        {"name": "NeetCode Roadmap", "type": "Practice", "difficulty": "Intermediate", "duration": "6 weeks", "url": "https://neetcode.io"},
        {"name": "Abdul Bari DSA", "type": "Video", "difficulty": "Beginner", "duration": "20 hrs", "url": "https://youtube.com"},
    ],
    "Python": [
        {"name": "Python for Everybody", "type": "Course", "difficulty": "Beginner", "duration": "4 weeks", "url": "https://py4e.com"},
        {"name": "Real Python Tutorials", "type": "Tutorial", "difficulty": "Intermediate", "duration": "Self-paced", "url": "https://realpython.com"},
    ],
    "REST APIs": [
        {"name": "FastAPI Docs", "type": "Documentation", "difficulty": "Intermediate", "duration": "1 week", "url": "https://fastapi.tiangolo.com"},
        {"name": "Build a REST API", "type": "Project", "difficulty": "Intermediate", "duration": "1 week", "url": "https://youtube.com"},
    ],
    "Git & GitHub": [
        {"name": "Git & GitHub Crash Course", "type": "Video", "difficulty": "Beginner", "duration": "2 hrs", "url": "https://youtube.com"},
        {"name": "Learn Git Branching", "type": "Practice", "difficulty": "Beginner", "duration": "3 hrs", "url": "https://learngitbranching.js.org"},
    ],
    "SQL": [
        {"name": "SQLBolt", "type": "Practice", "difficulty": "Beginner", "duration": "1 week", "url": "https://sqlbolt.com"},
        {"name": "Mode SQL Tutorial", "type": "Tutorial", "difficulty": "Intermediate", "duration": "2 weeks", "url": "https://mode.com/sql-tutorial"},
    ],
    "React": [
        {"name": "React Official Docs", "type": "Documentation", "difficulty": "Intermediate", "duration": "2 weeks", "url": "https://react.dev"},
        {"name": "Scrimba React Course", "type": "Course", "difficulty": "Intermediate", "duration": "3 weeks", "url": "https://scrimba.com"},
    ],
    "JavaScript": [
        {"name": "JavaScript.info", "type": "Documentation", "difficulty": "Intermediate", "duration": "4 weeks", "url": "https://javascript.info"},
        {"name": "The Odin Project", "type": "Course", "difficulty": "Beginner", "duration": "6 weeks", "url": "https://theodinproject.com"},
    ],
    "Machine Learning": [
        {"name": "Andrew Ng ML Specialization", "type": "Course", "difficulty": "Intermediate", "duration": "8 weeks", "url": "https://coursera.org"},
        {"name": "Scikit-learn Docs", "type": "Documentation", "difficulty": "Intermediate", "duration": "Self-paced", "url": "https://scikit-learn.org"},
    ],
}

DEFAULT_RESOURCES = [
    {"name": "Curated YouTube Playlist", "type": "Video", "difficulty": "Beginner", "duration": "Self-paced", "url": "https://youtube.com"},
    {"name": "Official Documentation", "type": "Documentation", "difficulty": "Intermediate", "duration": "Self-paced", "url": "https://google.com"},
    {"name": "Hands-on Practice Set", "type": "Practice", "difficulty": "Intermediate", "duration": "1 week", "url": "https://google.com"},
]


def resources_for(skill):
    return RESOURCES.get(skill, DEFAULT_RESOURCES)


# ---------------------------------------------------------------------------
# PROJECT RECOMMENDATIONS
# ---------------------------------------------------------------------------
PROJECTS = [
    {"id": "p1", "title": "Student Expense Tracker", "level": "Beginner", "time": "1 week", "description": "A CLI or web app to track income and expenses with reports.", "stack": ["Python", "SQL"], "skills_gained": ["Python", "SQL", "REST APIs", "Git & GitHub"], "features": ["Add/edit transactions", "Monthly summary", "Category charts", "Export to CSV"], "careers": ["software-developer", "data-analyst"]},
    {"id": "p2", "title": "Notes REST API", "level": "Intermediate", "time": "1 week", "description": "A backend service with authentication and CRUD notes.", "stack": ["Python", "FastAPI", "MongoDB"], "skills_gained": ["REST APIs", "Backend Development", "Python"], "features": ["JWT auth", "CRUD endpoints", "Search", "Pagination"], "careers": ["software-developer", "full-stack-developer"]},
    {"id": "p3", "title": "Personal Portfolio Website", "level": "Beginner", "time": "4 days", "description": "A responsive portfolio to showcase your work.", "stack": ["React", "Tailwind"], "skills_gained": ["React", "HTML/CSS", "JavaScript"], "features": ["Responsive design", "Project gallery", "Contact form", "Dark mode"], "careers": ["full-stack-developer", "ui-ux-designer"]},
    {"id": "p4", "title": "Sales Analytics Dashboard", "level": "Intermediate", "time": "2 weeks", "description": "Analyze and visualize a sales dataset with interactive charts.", "stack": ["Python", "Pandas", "Power BI"], "skills_gained": ["SQL", "Data Visualization", "Python", "Statistics"], "features": ["KPI cards", "Trend charts", "Filters", "Insights report"], "careers": ["data-analyst", "data-scientist"]},
    {"id": "p5", "title": "House Price Predictor", "level": "Advanced", "time": "2 weeks", "description": "Train and deploy a regression model to predict prices.", "stack": ["Python", "Scikit-learn"], "skills_gained": ["Machine Learning", "Python", "Statistics"], "features": ["Data cleaning", "Feature engineering", "Model training", "API deployment"], "careers": ["data-scientist", "ai-ml-engineer"]},
    {"id": "p6", "title": "Full Stack Chat App", "level": "Advanced", "time": "3 weeks", "description": "Real-time chat with authentication and rooms.", "stack": ["React", "Node.js", "MongoDB"], "skills_gained": ["React", "Node.js", "JavaScript", "MongoDB", "REST APIs"], "features": ["Real-time messaging", "Auth", "Chat rooms", "Online status"], "careers": ["full-stack-developer", "software-developer"]},
    {"id": "p7", "title": "Vulnerability Scanner", "level": "Advanced", "time": "2 weeks", "description": "A tool that scans a network for common vulnerabilities.", "stack": ["Python", "Linux"], "skills_gained": ["Networking", "Security Fundamentals", "Python"], "features": ["Port scanning", "Service detection", "Report generation"], "careers": ["cybersecurity-analyst"]},
    {"id": "p8", "title": "CI/CD Pipeline Demo", "level": "Intermediate", "time": "1 week", "description": "Automate build, test and deploy for a sample app.", "stack": ["Docker", "GitHub Actions"], "skills_gained": ["Docker", "CI/CD", "Linux"], "features": ["Automated tests", "Docker build", "Auto deploy"], "careers": ["devops-engineer", "cloud-engineer"]},
]


# ---------------------------------------------------------------------------
# OPPORTUNITIES
# ---------------------------------------------------------------------------
OPPORTUNITIES = [
    {"id": "o1", "role": "Software Developer Intern", "company": "TechNova Labs", "type": "Internship", "mode": "Remote", "location": "Remote", "deadline": "2026-07-15", "stipend": "₹25,000/mo", "description": "Work with senior engineers on backend services and internal tools.", "required_skills": [{"name": "Python", "level": "intermediate"}, {"name": "SQL", "level": "intermediate"}, {"name": "Git & GitHub", "level": "intermediate"}, {"name": "Data Structures & Algorithms", "level": "intermediate"}, {"name": "REST APIs", "level": "intermediate"}], "careers": ["software-developer", "full-stack-developer"]},
    {"id": "o2", "role": "Full Stack Developer Intern", "company": "Brightframe", "type": "Internship", "mode": "Hybrid", "location": "Bangalore", "deadline": "2026-07-20", "stipend": "₹30,000/mo", "description": "Build features across a React + Node stack for a growing SaaS.", "required_skills": [{"name": "React", "level": "intermediate"}, {"name": "JavaScript", "level": "advanced"}, {"name": "Node.js", "level": "intermediate"}, {"name": "REST APIs", "level": "intermediate"}, {"name": "Git & GitHub", "level": "intermediate"}], "careers": ["full-stack-developer"]},
    {"id": "o3", "role": "Data Analyst Trainee", "company": "InsightGrid", "type": "Full Time", "mode": "On-site", "location": "Pune", "deadline": "2026-08-01", "stipend": "₹5.5 LPA", "description": "Analyze business data and build dashboards for stakeholders.", "required_skills": [{"name": "SQL", "level": "advanced"}, {"name": "Excel", "level": "advanced"}, {"name": "Python", "level": "intermediate"}, {"name": "Data Visualization", "level": "intermediate"}], "careers": ["data-analyst"]},
    {"id": "o4", "role": "Backend Developer (Junior)", "company": "CloudPile", "type": "Full Time", "mode": "Remote", "location": "Remote", "deadline": "2026-07-30", "stipend": "₹8 LPA", "description": "Design and maintain scalable APIs and services.", "required_skills": [{"name": "Python", "level": "advanced"}, {"name": "REST APIs", "level": "advanced"}, {"name": "Backend Development", "level": "intermediate"}, {"name": "SQL", "level": "intermediate"}, {"name": "Data Structures & Algorithms", "level": "intermediate"}], "careers": ["software-developer"]},
    {"id": "o5", "role": "ML Engineering Intern", "company": "NeuralWorks", "type": "Internship", "mode": "Remote", "location": "Remote", "deadline": "2026-08-10", "stipend": "₹35,000/mo", "description": "Support model training and evaluation pipelines.", "required_skills": [{"name": "Python", "level": "advanced"}, {"name": "Machine Learning", "level": "intermediate"}, {"name": "Statistics", "level": "intermediate"}, {"name": "Mathematics", "level": "intermediate"}], "careers": ["ai-ml-engineer", "data-scientist"]},
    {"id": "o6", "role": "Smart India Hackathon 2026", "company": "Government of India", "type": "Hackathon", "mode": "On-site", "location": "Multiple Cities", "deadline": "2026-07-05", "stipend": "₹1,00,000 prize", "description": "National-level hackathon solving real government problem statements.", "required_skills": [{"name": "Problem Solving", "level": "intermediate"}, {"name": "Python", "level": "intermediate"}, {"name": "React", "level": "beginner"}], "careers": ["software-developer", "full-stack-developer", "ai-ml-engineer"]},
    {"id": "o7", "role": "Frontend Developer Intern", "company": "Pixelmint", "type": "Internship", "mode": "Remote", "location": "Remote", "deadline": "2026-07-25", "stipend": "₹20,000/mo", "description": "Build polished, responsive UIs with React and Tailwind.", "required_skills": [{"name": "React", "level": "intermediate"}, {"name": "JavaScript", "level": "intermediate"}, {"name": "HTML/CSS", "level": "advanced"}], "careers": ["full-stack-developer", "ui-ux-designer"]},
    {"id": "o8", "role": "Cloud Support Associate", "company": "SkyStack", "type": "Full Time", "mode": "Hybrid", "location": "Hyderabad", "deadline": "2026-08-15", "stipend": "₹6 LPA", "description": "Support and maintain cloud infrastructure for enterprise clients.", "required_skills": [{"name": "Linux", "level": "intermediate"}, {"name": "Cloud Platforms", "level": "intermediate"}, {"name": "Networking", "level": "intermediate"}, {"name": "Docker", "level": "beginner"}], "careers": ["cloud-engineer", "devops-engineer"]},
    {"id": "o9", "role": "Google Summer of Code", "company": "Open Source Orgs", "type": "Internship", "mode": "Remote", "location": "Remote", "deadline": "2026-07-12", "stipend": "$3,000 stipend", "description": "Contribute to open-source projects over the summer with mentorship.", "required_skills": [{"name": "Git & GitHub", "level": "intermediate"}, {"name": "Python", "level": "intermediate"}, {"name": "Problem Solving", "level": "intermediate"}], "careers": ["software-developer", "full-stack-developer"]},
    {"id": "o10", "role": "Data Science Scholarship", "company": "DataCamp", "type": "Scholarship", "mode": "Remote", "location": "Remote", "deadline": "2026-08-20", "stipend": "Full access", "description": "Merit scholarship for a complete data science learning track.", "required_skills": [{"name": "Python", "level": "beginner"}, {"name": "Statistics", "level": "beginner"}], "careers": ["data-scientist", "data-analyst"]},
]


# ---------------------------------------------------------------------------
# GAMIFICATION BADGES
# ---------------------------------------------------------------------------
BADGES = [
    {"id": "b1", "title": "Skill Milestone", "icon": "Trophy", "description": "Reached 5 tracked skills", "metric": "skills", "threshold": 5},
    {"id": "b2", "title": "Learning Streak", "icon": "Flame", "description": "Completed 5 learning steps", "metric": "learning", "threshold": 5},
    {"id": "b3", "title": "Career Goal Set", "icon": "Target", "description": "Chose a target career", "metric": "career", "threshold": 1},
    {"id": "b4", "title": "Project Builder", "icon": "Rocket", "description": "Completed a project", "metric": "projects", "threshold": 1},
    {"id": "b5", "title": "First Application", "icon": "Briefcase", "description": "Applied to an opportunity", "metric": "applications", "threshold": 1},
    {"id": "b6", "title": "Interview Ready", "icon": "Award", "description": "Reached 70% career readiness", "metric": "readiness", "threshold": 70},
]
