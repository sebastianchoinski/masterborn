const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const jobOffers = [
    [1, "Software Engineer", "Responsible for developing software applications.", "$50,000 - $70,000", "New York"],
    [2, "Data Scientist", "Analyze large datasets to uncover insights and improve decision making.", "$70,000 - $90,000", "San Francisco"],
    [3, "Product Manager", "Manage product development from inception to launch.", "$90,000 - $120,000", "Chicago"],
    [4, "UX Designer", "Design user-friendly interfaces for web and mobile applications.", "$60,000 - $80,000", "Los Angeles"],
    [5, "DevOps Engineer", "Automate and monitor operational processes within the IT infrastructure.", "$80,000 - $100,000", "Austin"],
    [6, "Full Stack Developer", "Work on both front-end and back-end development of applications.", "$70,000 - $95,000", "Seattle"],
    [7, "Data Analyst", "Transform data into actionable insights for decision makers.", "$50,000 - $70,000", "Boston"],
    [8, "Product Designer", "Create product concepts and designs with a user-centric approach.", "$60,000 - $85,000", "San Francisco"],
    [9, "Web Developer", "Develop and maintain websites using HTML, CSS, and JavaScript.", "$55,000 - $75,000", "New York"],
    [10, "Mobile App Developer", "Design and develop mobile applications for iOS and Android.", "$70,000 - $90,000", "San Diego"],
    [11, "Business Analyst", "Analyze business processes and provide recommendations for improvements.", "$65,000 - $85,000", "Chicago"],
    [12, "QA Engineer", "Ensure the quality of software by conducting tests and reporting issues.", "$60,000 - $80,000", "Austin"],
    [13, "Network Administrator", "Manage and monitor company network infrastructure.", "$75,000 - $95,000", "Dallas"],
    [14, "Cloud Engineer", "Design, build, and maintain cloud-based systems and solutions.", "$85,000 - $105,000", "Los Angeles"],
    [15, "Systems Architect", "Design and implement IT systems for enterprise environments.", "$100,000 - $120,000", "Seattle"],
];

const recruiters = [
    ["Anna Kowalska", "anna.kowalska@example.com", "123-456-789", "TechCorp"],
    ["Marek Nowak", "marek.nowak@example.com", "234-567-890", "WebSolutions"],
    ["Katarzyna Wisniewska", "katarzyna.wisniewska@example.com", "345-678-901", "DevWorks"],
    ["Piotr Zawisza", "piotr.zawisza@example.com", "456-789-012", "SoftTech"],
    ["Jolanta Malinowska", "jolanta.malinowska@example.com", "567-890-123", "Innovative Systems"],
];

async function main() {
    for (const [id, title, description, salaryRange, location] of jobOffers) {
        await prisma.jobOffer.upsert({
            where: { id },
            update: { title, description, salaryRange, location },
            create: { id, title, description, salaryRange, location },
        });
    }

    for (const [name, email, phone, company] of recruiters) {
        await prisma.recruiter.upsert({
            where: { email },
            update: { name, phone, company },
            create: { name, email, phone, company },
        });
    }
}

main()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });