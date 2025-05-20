document.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling (keep existing)
    const navLinks = document.querySelectorAll('nav ul li a:not(.btn-resume)');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                const headerOffset = document.querySelector('header').offsetHeight;
                const elementPosition = targetSection.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                if (navUL.classList.contains('active')) {
                    navUL.classList.remove('active');
                    menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
                }
            }
        });
    });

    // Mobile menu toggle (keep existing)
    const menuToggle = document.querySelector('.menu-toggle');
    const navUL = document.querySelector('nav ul');
    menuToggle.addEventListener('click', () => {
        navUL.classList.toggle('active');
        menuToggle.innerHTML = navUL.classList.contains('active') ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
    });

    // Theme Switcher (keep existing)
    const themeSwitcher = document.querySelector('.theme-switcher');
    const body = document.body;
    const moonIcon = '<i class="fas fa-moon"></i>';
    const sunIcon = '<i class="fas fa-sun"></i>';
    const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

    function setTheme(theme) {
        if (theme === 'dark') {
            body.classList.add('dark-mode');
            themeSwitcher.innerHTML = sunIcon;
            localStorage.setItem('theme', 'dark');
        } else {
            body.classList.remove('dark-mode');
            themeSwitcher.innerHTML = moonIcon;
            localStorage.setItem('theme', 'light');
        }
        // Update CSS variable for particle color based on theme
        const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();
        const rgb = primaryColor.startsWith('#') ? hexToRgb(primaryColor) : parseRgb(primaryColor);
        if (rgb) {
            document.documentElement.style.setProperty('--primary-color-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
        }
    }
    
    // Helper functions for color conversion
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    function parseRgb(rgbString) { // e.g. "rgb(52, 152, 219)"
        const match = rgbString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
        return match ? { r: parseInt(match[1]), g: parseInt(match[2]), b: parseInt(match[3]) } : null;
    }


    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        setTheme(savedTheme);
    } else if (prefersDarkScheme.matches) {
        setTheme('dark');
    } else {
        setTheme('light');
    }
    // Initial call to set --primary-color-rgb
    const initialPrimaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();
    const initialRgb = initialPrimaryColor.startsWith('#') ? hexToRgb(initialPrimaryColor) : parseRgb(initialPrimaryColor);
    if (initialRgb) {
        document.documentElement.style.setProperty('--primary-color-rgb', `${initialRgb.r}, ${initialRgb.g}, ${initialRgb.b}`);
    }


    themeSwitcher.addEventListener('click', () => {
        const newTheme = body.classList.contains('dark-mode') ? 'light' : 'dark';
        setTheme(newTheme);
    });
    prefersDarkScheme.addEventListener("change", e => { // Listen for OS theme changes
        if (!localStorage.getItem('theme')) { // Only if no user preference is set
            setTheme(e.matches ? 'dark' : 'light');
        }
    });

    // Update current year in footer (keep existing)
    document.getElementById('currentYear').textContent = new Date().getFullYear();

    // Typed.js Initialization
    if (document.getElementById('typed-output')) {
        new Typed('#typed-output', {
            strings: ["Aspiring Data Scientist", "Data-Driven Problem Solver", "Turning Data into Insights", "Ready to Make an Impact"],
            typeSpeed: 70,
            backSpeed: 40,
            loop: true,
            smartBackspace: true,
            cursorChar: '_',
        });
    }

    // Load Projects from JSON and Display
    const projectsGrid = document.getElementById('projectsGrid');
    let projectsData = []; // To store fetched projects

    async function loadProjects() {
        try {
            const response = await fetch('projects.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            projectsData = await response.json();
            displayProjects(projectsData);
        } catch (error) {
            console.error("Could not load projects:", error);
            if (projectsGrid) projectsGrid.innerHTML = "<p>Error loading projects. Please try again later.</p>";
        }
    }

    function displayProjects(projects) {
        if (!projectsGrid) return;
        projectsGrid.innerHTML = ''; // Clear existing
        projects.forEach(project => {
            const projectCard = document.createElement('div');
            projectCard.classList.add('project-card');
            projectCard.dataset.projectId = project.id; // For modal

            projectCard.innerHTML = `
                <img src="${project.thumbnail}" alt="${project.title} Thumbnail">
                <div class="project-info">
                    <h3>${project.title}</h3>
                    <p>${project.short_description}</p>
                    <p class="tech-stack"><strong>Tech:</strong> ${project.tech_stack.join(', ')}</p>
                    <div class="project-links">
                        ${project.github_link ? `<a href="${project.github_link}" target="_blank" class="btn-link" aria-label="View ${project.title} on GitHub"><i class="fab fa-github"></i> GitHub</a>` : ''}
                        ${project.live_demo_link ? `<a href="${project.live_demo_link}" target="_blank" class="btn-link" aria-label="View ${project.title} Live Demo"><i class="fas fa-external-link-alt"></i> Live Demo</a>` : ''}
                        ${project.case_study_link ? `<a href="${project.case_study_link}" target="_blank" class="btn-link" aria-label="Read ${project.title} Case Study"><i class="fas fa-file-alt"></i> Case Study</a>` : ''}
                        <button class="btn-details" aria-label="View details for ${project.title}">Learn More</button>
                    </div>
                </div>
            `;
            projectsGrid.appendChild(projectCard);
        });
        addModalEventListeners();
    }

    // Project Modal Functionality
    const modal = document.getElementById('projectModal');
    const closeModalButton = document.querySelector('.modal .close-button');

    function openModal(projectId) {
        const project = projectsData.find(p => p.id === projectId);
        if (!project || !modal) return;

        document.getElementById('modalProjectImage').src = project.thumbnail;
        document.getElementById('modalProjectImage').alt = `${project.title} Main Image`;
        document.getElementById('modalProjectTitle').textContent = project.title;
        document.getElementById('modalProjectDescription').textContent = project.long_description;
        document.getElementById('modalProjectTech').textContent = project.tech_stack.join(', ');

        const linksContainer = document.getElementById('modalProjectLinks');
        linksContainer.innerHTML = ''; // Clear previous links
        if (project.github_link) linksContainer.innerHTML += `<a href="${project.github_link}" target="_blank" class="btn-link"><i class="fab fa-github"></i> GitHub</a>`;
        if (project.live_demo_link) linksContainer.innerHTML += `<a href="${project.live_demo_link}" target="_blank" class="btn-link"><i class="fas fa-external-link-alt"></i> Live Demo</a>`;
        if (project.case_study_link) linksContainer.innerHTML += `<a href="${project.case_study_link}" target="_blank" class="btn-link"><i class="fas fa-file-alt"></i> Case Study</a>`;
        
        const detailsList = document.getElementById('modalProjectDetails');
        detailsList.innerHTML = ''; // Clear previous details
        project.details.forEach(detail => {
            const li = document.createElement('li');
            li.textContent = detail;
            detailsList.appendChild(li);
        });

        modal.classList.add('open');
        document.body.style.overflow = 'hidden'; // Prevent background scroll
        modal.setAttribute('aria-hidden', 'false');
        closeModalButton.focus(); // For accessibility
    }

    function closeModal() {
        if (!modal) return;
        modal.classList.remove('open');
        document.body.style.overflow = 'auto';
        modal.setAttribute('aria-hidden', 'true');
         // Return focus to the button that opened the modal (more complex, for simplicity we skip this here but good for a11y)
    }

    function addModalEventListeners() {
        const detailButtons = document.querySelectorAll('.project-card .btn-details');
        detailButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const card = e.target.closest('.project-card');
                openModal(card.dataset.projectId);
            });
        });

        if (closeModalButton) {
            closeModalButton.addEventListener('click', closeModal);
        }

        if (modal) {
            modal.addEventListener('click', (event) => { // Close if clicked outside content
                if (event.target === modal) {
                    closeModal();
                }
            });
        }
        
        // Close modal with Escape key
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && modal && modal.classList.contains('open')) {
                closeModal();
            }
        });
    }

    // Scroll animations (Intersection Observer - keep existing or enhance)
    const animatedElements = document.querySelectorAll('.skill-category, .timeline-item'); // Add .timeline-item
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = `fadeIn 0.8s ease-out forwards`;
                entry.target.style.opacity = '0'; // Set initial opacity for animation
                // observer.unobserve(entry.target); // Optional
            }
        });
    }, { threshold: 0.1 });
    animatedElements.forEach(el => observer.observe(el));

    // Initial load
    loadProjects();
});