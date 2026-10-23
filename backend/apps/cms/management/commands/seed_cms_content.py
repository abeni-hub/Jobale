"""
Seed the CMS with the company's existing (verified) website content.

This command mirrors the content that already exists on the public website so
that the admin dashboard starts with the real, verified company content rather
than placeholder data. It is idempotent — re-running it updates existing
records instead of duplicating them.

Usage:
    python manage.py seed_cms_content
    python manage.py seed_cms_content --no-images   # skip downloading imagery
"""

import io
import os
import urllib.request

from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils.text import slugify

from apps.cms.models import (
    AboutBlock,
    AboutContent,
    ContactSettings,
    FooterSettings,
    HeroContent,
    NavigationItem,
    PageSection,
    QualitySafetyContent,
    SEOSettings,
    SiteSettings,
    get_singleton,
)
from apps.projects.models import Project, ProjectCategory
from apps.services.models import Service

HERO_IMAGE = ('https://images.pexels.com/photos/4170185/pexels-photo-4170185.jpeg'
              '?auto=compress&cs=tinysrgb&w=1920&h=1080')

SERVICES = [
    {
        'slug': 'building-construction',
        'title': 'Building Construction',
        'short_name': 'Building Construction',
        'icon': 'Building2',
        'summary': (
            'General contracting for residential, commercial, institutional, industrial, and '
            'multi-storey structures — delivered with disciplined supervision and quality '
            'workmanship.'
        ),
        'overview': (
            'Jobale Engineering PLC undertakes general building construction projects across '
            'residential, commercial, institutional, and industrial categories. Our approach '
            'integrates experienced site supervision, skilled labour, and systematic quality '
            'control to deliver structures that meet approved drawings and specifications.'
        ),
        'scope': [
            'Residential buildings', 'Commercial buildings', 'Institutional buildings',
            'Industrial buildings', 'Multi-storey structures',
        ],
        'applications': [
            'Private residences and apartment complexes',
            'Office and retail buildings',
            'Schools, hospitals, and government facilities',
            'Warehouses and light industrial structures',
        ],
        'approach': (
            'We assign qualified site engineers and foremen to every project, maintain '
            'construction schedules aligned with project milestones, and coordinate closely '
            'with clients, consultants, and subcontractors to ensure drawings and '
            'specifications are faithfully executed.'
        ),
        'quality_safety': (
            'Each construction stage is inspected against approved plans. Materials are checked '
            'on delivery, and workmanship is verified before proceeding to subsequent stages. '
            'Site safety protocols, including PPE use and safety briefings, are enforced '
            'throughout.'
        ),
        'image': ('https://images.pexels.com/photos/4170185/pexels-photo-4170185.jpeg'
                  '?auto=compress&cs=tinysrgb&w=1260&h=750'),
        'cta_label': 'Explore Building Construction',
        'cta_url': '/services/building-construction',
    },
    {
        'slug': 'civil-infrastructure',
        'title': 'Civil & Infrastructure Works',
        'short_name': 'Civil & Infrastructure',
        'icon': 'Ruler',
        'summary': (
            'Roads, drainage, water supply, earthworks, and related civil infrastructure — '
            'engineered for durability and community benefit.'
        ),
        'overview': (
            'Our civil and infrastructure division handles road construction, drainage systems, '
            'water supply and sanitation, excavation, earthworks, and boundary walls. We '
            'deliver infrastructure that serves communities and supports industrial operations '
            'with reliable, long-lasting results.'
        ),
        'scope': [
            'Roads and access roads', 'Drainage and culverts', 'Water supply and sanitation',
            'Excavation and earthworks', 'Boundary walls and related works',
        ],
        'applications': [
            'Access roads for industrial and community facilities',
            'Drainage systems for flood and runoff management',
            'Rural and community water supply schemes',
            'Site preparation and earthworks for new developments',
        ],
        'approach': (
            'Civil works are planned around site conditions, survey data, and engineering '
            'specifications. We deploy appropriate plant and equipment, maintain progress '
            'against baseline schedules, and document each stage for client review and approval.'
        ),
        'quality_safety': (
            'Materials are tested for compliance with specified standards. Earthworks and '
            'concrete works are inspected at each stage. Traffic and public safety measures '
            'are implemented where works affect surrounding areas.'
        ),
        'image': ('https://images.pexels.com/photos/4390530/pexels-photo-4390530.jpeg'
                  '?auto=compress&cs=tinysrgb&w=1260&h=750'),
        'cta_label': 'Explore Civil & Infrastructure',
        'cta_url': '/services/civil-infrastructure',
    },
    {
        'slug': 'finishing-fit-out',
        'title': 'Finishing & Fit-Out',
        'short_name': 'Finishing & Fit-Out',
        'icon': 'Layers',
        'summary': (
            'Interior and exterior finishing — flooring, painting, ceilings, glazing, and '
            'joinery — executed to a high standard of detail and durability.'
        ),
        'overview': (
            'We provide comprehensive finishing and fit-out services that complete a building '
            'to a functional, durable, and aesthetically refined standard. From flooring to '
            'ceilings, painting to glazing, our finishing teams work to approved finishes '
            'schedules and quality benchmarks.'
        ),
        'scope': [
            'Flooring and tiling', 'Painting and plastering',
            'Ceilings and interior finishes', 'Aluminium and glazing',
            'Joinery and partitions',
        ],
        'applications': [
            'Office and commercial interior fit-outs',
            'Residential finishing packages',
            'Institutional facility interiors',
            'Renovation and refurbishment finishing',
        ],
        'approach': (
            'Finishing works are sequenced after structural completion and coordinated across '
            'trades to avoid conflicts. Samples and mock-ups are reviewed with the client where '
            'appropriate, and final finishes are inspected against the approved schedule.'
        ),
        'quality_safety': (
            'Surface preparation is verified before application. Paint, tile, and finish '
            'materials are checked for consistency and conformity. Dust and fume control '
            'measures protect workers and occupants during finishing operations.'
        ),
        'image': ('https://images.pexels.com/photos/36035072/pexels-photo-36035072.jpeg'
                  '?auto=compress&cs=tinysrgb&w=1260&h=750'),
        'cta_label': 'Explore Finishing & Fit-Out',
        'cta_url': '/services/finishing-fit-out',
    },
    {
        'slug': 'building-services-mep',
        'title': 'Building Services (MEP)',
        'short_name': 'Building Services (MEP)',
        'icon': 'Wrench',
        'summary': (
            'Mechanical, electrical, and plumbing installations — including water, drainage, '
            'electrical, and sanitary systems — integrated into the building package.'
        ),
        'overview': (
            'Our building services division covers electrical installations, plumbing, water '
            'and drainage systems, and sanitary fixtures. We coordinate MEP installations with '
            'structural and finishing works to ensure properly integrated, functional building '
            'systems.'
        ),
        'scope': [
            'Electrical installations', 'Plumbing', 'Water and drainage installations',
            'Sanitary fixtures and fittings',
        ],
        'applications': [
            'Electrical wiring and distribution for new buildings',
            'Plumbing and sanitary installation packages',
            'Water supply and drainage system installation',
            'MEP works for renovation and upgrade projects',
        ],
        'approach': (
            'MEP works are planned in coordination with structural and finishing schedules. '
            'Installations follow approved drawings and applicable standards, with testing and '
            'commissioning carried out before handover.'
        ),
        'quality_safety': (
            'Electrical installations are tested for safety and functionality. Plumbing and '
            'drainage systems are pressure-tested and inspected. All MEP works are documented '
            'and handed over with as-built information.'
        ),
        'image': ('https://images.pexels.com/photos/34938439/pexels-photo-34938439.jpeg'
                  '?auto=compress&cs=tinysrgb&w=1260&h=750'),
        'cta_label': 'Explore Building Services',
        'cta_url': '/services/building-services-mep',
    },
    {
        'slug': 'renovation-maintenance',
        'title': 'Renovation & Maintenance',
        'short_name': 'Renovation & Maintenance',
        'icon': 'HardHat',
        'summary': (
            'Rehabilitation, repairs, periodic maintenance, and project supervision — extending '
            'the service life and performance of existing buildings.'
        ),
        'overview': (
            'We provide renovation, rehabilitation, and maintenance services for existing '
            'buildings and facilities. Our team also offers project supervision and management, '
            'and design support and consultancy for clients who need engineering guidance '
            'alongside construction services.'
        ),
        'scope': [
            'Rehabilitation', 'Building repairs', 'Periodic maintenance',
            'Project supervision and management',
            'Design support, consultancy, and related services',
        ],
        'applications': [
            'Building rehabilitation and upgrade projects',
            'Healthcare facility renovation and refurbishment',
            'Periodic maintenance for institutional and commercial buildings',
            'Project supervision on behalf of owners and developers',
        ],
        'approach': (
            'Renovation projects begin with a condition assessment and scope definition. Works '
            'are planned to minimise disruption where facilities remain operational. '
            'Maintenance programmes are scheduled and documented for accountability.'
        ),
        'quality_safety': (
            'Existing structural and service conditions are assessed before commencing works. '
            'Renovation works are inspected against the approved scope. Safety measures address '
            'the specific risks of working in and around occupied or partially occupied '
            'buildings.'
        ),
        'image': ('https://images.pexels.com/photos/27134625/pexels-photo-27134625.jpeg'
                  '?auto=compress&cs=tinysrgb&w=1260&h=750'),
        'cta_label': 'Explore Renovation & Maintenance',
        'cta_url': '/services/renovation-maintenance',
    },
]

CATEGORIES = [
    ('Building Construction', 'Building construction works across residential, commercial, institutional and industrial sectors.'),
    ('Civil Works', 'Roads, drainage, earthworks, boundary walls and related civil infrastructure.'),
    ('Water & Sanitation', 'Community water supply, distribution and sanitation systems.'),
    ('Rehabilitation', 'Renovation, rehabilitation and upgrade of existing buildings and facilities.'),
]

PROJECTS = [
    {
        'slug': 'lemi-national-cement-ditch-slope-protection',
        'name': 'Lemi National Cement — Production-Line Ditch & Slope Protection',
        'category': 'Civil Works',
        'client': 'Lemi National Cement',
        'location': 'Lemi, Amhara Region, Ethiopia',
        'summary': 'Ditch construction and slope protection works on the production line at Lemi National Cement.',
        'description': (
            'This project involved the construction of a ditch and associated slope protection '
            'works along the production line at Lemi National Cement. The works were designed '
            'to manage surface water, protect adjacent slopes from erosion, and ensure safe and '
            'stable ground conditions around the production facility.'
        ),
        'scope': ['Production-line ditch construction', 'Slope protection works',
                  'Drainage and erosion control'],
        'image': ('https://images.pexels.com/photos/5505706/pexels-photo-5505706.jpeg'
                  '?auto=compress&cs=tinysrgb&w=1260&h=750'),
        'featured': True,
    },
    {
        'slug': 'lemi-national-cement-drainage-ditch',
        'name': 'Lemi National Cement — Production-Line Drainage Ditch',
        'category': 'Civil Works',
        'client': 'Lemi National Cement',
        'location': 'Lemi, Amhara Region, Ethiopia',
        'summary': 'Drainage ditch construction for the production line at Lemi National Cement.',
        'description': (
            'A dedicated drainage ditch project for the production line at Lemi National '
            'Cement, providing engineered surface water management to protect the facility and '
            'surrounding ground from water-related damage during operations.'
        ),
        'scope': ['Drainage ditch construction', 'Surface water management',
                  'Civil works for industrial facility'],
        'image': ('https://images.pexels.com/photos/18468425/pexels-photo-18468425.jpeg'
                  '?auto=compress&cs=tinysrgb&w=1260&h=750'),
        'featured': True,
    },
    {
        'slug': 'sekota-woldia-water-supply-sanitation',
        'name': 'Sekota & Woldia — Community Water Supply & Sanitation',
        'category': 'Water & Sanitation',
        'client': '',
        'location': 'Sekota and Woldia, Amhara Region, Ethiopia',
        'summary': 'Community water supply and sanitation project serving the Sekota and Woldia areas.',
        'description': (
            'A community-focused water supply and sanitation project serving the Sekota and '
            'Woldia areas. The project aimed to improve access to clean water and sanitation '
            'facilities for local communities, contributing to public health and quality of life.'
        ),
        'scope': ['Community water supply system', 'Sanitation infrastructure',
                  'Water distribution network'],
        'image': ('https://images.pexels.com/photos/28101466/pexels-photo-28101466.jpeg'
                  '?auto=compress&cs=tinysrgb&w=1260&h=750'),
        'featured': True,
    },
    {
        'slug': 'negele-general-hospital-water-supply',
        'name': 'Negele General Hospital — Water Supply Project',
        'category': 'Water & Sanitation',
        'client': '',
        'location': 'Negele, Oromia Region, Ethiopia',
        'summary': 'Water supply system installation for Negele General Hospital.',
        'description': (
            'A water supply project for Negele General Hospital, providing a reliable water '
            'distribution system to support healthcare operations and facility hygiene. The '
            'works included water supply infrastructure designed to meet the demands of a '
            'functioning hospital environment.'
        ),
        'scope': ['Hospital water supply system', 'Water distribution and storage',
                  'Sanitary infrastructure'],
        'image': ('https://images.pexels.com/photos/668300/pexels-photo-668300.jpeg'
                  '?auto=compress&cs=tinysrgb&w=1260&h=750'),
        'featured': True,
    },
    {
        'slug': 'shire-borera-water-supply',
        'name': 'Shire Borera — Water Supply Project',
        'category': 'Water & Sanitation',
        'client': '',
        'location': 'Shire, Tigray Region, Ethiopia',
        'summary': 'Water supply project for the Shire Borera community.',
        'description': (
            'A water supply project for the Shire Borera community, designed to extend reliable '
            'access to clean water for residential and community use. The project contributed to '
            'improved public health and daily living conditions in the area.'
        ),
        'scope': ['Community water supply', 'Water infrastructure development',
                  'Rural water access'],
        'image': ('https://images.pexels.com/photos/16566547/pexels-photo-16566547.jpeg'
                  '?auto=compress&cs=tinysrgb&w=1260&h=750'),
        'featured': False,
    },
    {
        'slug': 'dangote-cement-canteen-water-line',
        'name': 'Dangote Cement Factory — Canteen Building & Water-Line Works',
        'category': 'Building Construction',
        'client': 'Dangote Cement Factory',
        'location': 'Mugher, Oromia Region, Ethiopia',
        'summary': 'Canteen building construction and water-line works at Dangote Cement Factory.',
        'description': (
            'This project combined building construction and water-line installation works at '
            'Dangote Cement Factory. The canteen building was constructed to serve the factory '
            'workforce, with associated water-line works providing necessary water supply '
            'infrastructure.'
        ),
        'scope': ['Canteen building construction', 'Water-line installation',
                  'Building and civil works for industrial facility'],
        'image': ('https://images.pexels.com/photos/29590119/pexels-photo-29590119.jpeg'
                  '?auto=compress&cs=tinysrgb&w=1260&h=750'),
        'featured': True,
    },
    {
        'slug': 'asayita-town-water-supply',
        'name': 'Asayita Town — Water Supply Project',
        'category': 'Water & Sanitation',
        'client': '',
        'location': 'Asayita, Afar Region, Ethiopia',
        'summary': 'Water supply project for Asayita Town.',
        'description': (
            'A water supply project for Asayita Town, aimed at improving the reliability and '
            'reach of clean water access for the local population. The project involved the '
            'development of water supply infrastructure tailored to the needs of the community.'
        ),
        'scope': ['Town water supply system', 'Water distribution infrastructure',
                  'Community water access'],
        'image': ('https://images.pexels.com/photos/18682366/pexels-photo-18682366.jpeg'
                  '?auto=compress&cs=tinysrgb&w=1260&h=750'),
        'featured': False,
    },
    {
        'slug': 'kurba-hc-wadla-phc-rehabilitation',
        'name': 'Kurba HC & Wadla PHC — Rehabilitation Works',
        'category': 'Rehabilitation',
        'client': '',
        'location': 'Amhara Region, Ethiopia',
        'summary': 'Rehabilitation works at Kurba Health Centre and Wadla Primary Health Centre.',
        'description': (
            'Rehabilitation works at Kurba Health Centre and Wadla Primary Health Centre, '
            'involving building repairs, renovation, and facility improvements to restore and '
            'enhance the functionality of these healthcare facilities for continued community '
            'service.'
        ),
        'scope': ['Healthcare facility rehabilitation', 'Building repairs and renovation',
                  'Facility upgrade works'],
        'image': ('https://images.pexels.com/photos/27134625/pexels-photo-27134625.jpeg'
                  '?auto=compress&cs=tinysrgb&w=1260&h=750'),
        'featured': True,
    },
]

CORE_VALUES = [
    {'icon': 'ShieldCheck', 'title': 'Quality',
     'description': 'We deliver construction that meets approved drawings, specifications, and applicable standards — inspected at every stage.'},
    {'icon': 'Award', 'title': 'Integrity',
     'description': 'We communicate transparently, honour our commitments, and build trust through honest project relationships.'},
    {'icon': 'Clock', 'title': 'Reliability',
     'description': 'We manage schedules and budgets with discipline, flagging issues early and delivering on our undertakings.'},
    {'icon': 'Handshake', 'title': 'Client Focus',
     'description': "We work around the client's vision, requirements, and constraints — keeping them informed at every stage."},
    {'icon': 'TrendingUp', 'title': 'Continuous Improvement',
     'description': 'We review each project for lessons learned and apply them to improve our processes and outcomes.'},
    {'icon': 'Target', 'title': 'Safety',
     'description': 'We protect our workers, the public, and the environment through systematic safety practices on every site.'},
]

NAVIGATION = [
    ('Home', '/', 0),
    ('About', '/about', 1),
    ('Services', '/services', 2),
    ('Projects', '/projects', 3),
    ('Quality & Safety', '/quality-safety', 4),
    ('Our Team', '/team', 5),
    ('Contact', '/contact', 6),
]

PAGE_SECTIONS = [
    ('site-settings', 'Global Website Settings', 'Brand, logo, metadata and social links.', 0, 'Settings'),
    ('hero', 'Hero Section', 'The headline block at the top of the homepage.', 1, 'Sparkles'),
    ('about', 'About Us', 'Company introduction, mission, vision and values.', 2, 'Building2'),
    ('services', 'Services', 'Add, edit and publish the services you offer.', 3, 'Wrench'),
    ('projects', 'Projects & Portfolio', 'Manage projects, galleries and categories.', 4, 'FolderKanban'),
    ('clients', 'Clients & References', 'Reference clients and approved logos.', 5, 'Users'),
    ('quality-safety', 'Quality & Safety', 'Policies, standards and certifications.', 6, 'ShieldCheck'),
    ('testimonials', 'Testimonials', 'Approved client testimonials.', 7, 'Quote'),
    ('contact', 'Contact Information', 'Address, phone, email and map.', 8, 'Phone'),
    ('navigation', 'Navigation & Footer', 'Header links and footer content.', 9, 'Menu'),
    ('media', 'Media Library', 'Reusable images and documents.', 10, 'Image'),
    ('seo', 'Page SEO', 'Titles, descriptions and social sharing.', 11, 'Search'),
]


class Command(BaseCommand):
    help = 'Seed the CMS with the company\'s existing verified website content.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--no-images', action='store_true',
            help='Skip downloading website imagery (content is seeded without images).',
        )

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------
    def _download(self, url):
        """Download an image and return a ContentFile, or None on failure."""
        if not url:
            return None
        try:
            request = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(request, timeout=25) as response:
                data = response.read()
            if not data:
                return None
            return ContentFile(data, name=os.path.basename(url.split('?')[0]))
        except Exception as exc:  # pragma: no cover - network dependent
            self.stderr.write(f'  ! could not download {url}: {exc}')
            return None

    def _assign_image(self, instance, field_name, url):
        if self.no_images or not url:
            return
        content = self._download(url)
        if not content:
            return
        field = instance._meta.get_field(field_name)
        filename = field.generate_filename(instance, content.name)
        instance.image_file = None
        setattr(instance, field_name, content.name)
        getattr(instance, field_name).save(filename, content, save=False)

    # ------------------------------------------------------------------
    # Entry point
    # ------------------------------------------------------------------
    @transaction.atomic
    def handle(self, *args, **options):
        self.no_images = options.get('no_images', False)

        self.stdout.write('Seeding website settings...')
        settings_obj = get_singleton(SiteSettings)
        settings_obj.company_name = 'Jobale Engineering PLC'
        settings_obj.legal_name = 'Jobale Engineering PLC'
        settings_obj.slogan = 'Building Excellence, Delivering Trust.'
        settings_obj.brand_primary = '#086BB7'
        settings_obj.brand_navy = '#07111E'
        settings_obj.brand_accent = '#2A8AE0'
        settings_obj.default_page_title = (
            'Jobale Engineering PLC | Construction & Civil Engineering in Adama, Ethiopia'
        )
        settings_obj.default_meta_description = (
            'General construction and civil engineering company in Adama, Ethiopia. Building '
            'construction, civil infrastructure, water supply, renovation, and maintenance '
            'services.'
        )
        settings_obj.footer_copyright = '© {year} Jobale Engineering PLC. All rights reserved.'
        settings_obj.website_url = 'https://www.jobaleengineering.com'
        settings_obj.save()

        self.stdout.write('Seeding hero section...')
        hero = get_singleton(HeroContent)
        hero.eyebrow = 'JOBALE ENGINEERING PLC | CONSTRUCTION & CIVIL WORKS'
        hero.headline = 'Building with Precision.'
        hero.headline_accent = 'Delivering with Confidence.'
        hero.supporting_text = (
            'From building construction to civil infrastructure, Jobale Engineering delivers '
            'practical engineering solutions grounded in quality, safety, reliability, and '
            'lasting value.'
        )
        hero.primary_cta_label = 'Explore Our Projects'
        hero.primary_cta_url = '/projects'
        hero.secondary_cta_label = 'Discuss Your Project'
        hero.secondary_cta_url = '/contact'
        hero.overlay_opacity = 78
        hero.show_blueprint = True
        hero.slogan = 'Building Excellence, Delivering Trust.'
        hero.save()
        self._assign_image(hero, 'background_image', HERO_IMAGE)
        hero.save()

        self.stdout.write('Seeding about section...')
        about = get_singleton(AboutContent)
        about.eyebrow = 'Who We Are'
        about.heading = 'A Construction Company Built on Engineering Discipline and Trust'
        about.introduction = (
            'Jobale Engineering PLC is a professionally managed general construction company '
            'engaged in building construction, civil works, renovation, maintenance, and '
            'related engineering services. We are based in Adama, Oromia, Ethiopia.'
        )
        about.overview = (
            'Our company serves government institutions, public procurement departments, NGOs, '
            'international organizations, real estate developers, private businesses, '
            'consultants, and individual clients. We bring disciplined project management, '
            'experienced site supervision, and a systematic approach to quality and safety to '
            'every engagement. We are committed to delivering construction that meets approved '
            'drawings and specifications, on schedule and on budget, with workmanship and '
            'materials that stand the test of time.'
        )
        about.mission = (
            'To deliver practical engineering and construction solutions that meet client '
            'requirements, comply with approved standards, and are executed with discipline, '
            'safety, and transparency — building long-term client relationships through '
            'reliable performance.'
        )
        about.vision = (
            'To be a trusted and respected construction and engineering company in Ethiopia — '
            'recognised for quality workmanship, safe practices, and projects that deliver '
            'lasting value to our clients and communities.'
        )
        about.core_values = CORE_VALUES
        about.history = (
            'Jobale Engineering PLC has undertaken construction and civil engineering projects '
            'across multiple regions of Ethiopia, working on building construction, civil '
            'infrastructure, water supply and sanitation, and rehabilitation projects for '
            'industrial clients, communities, and public facilities. Our project experience '
            'includes works at industrial facilities such as Lemi National Cement and Dangote '
            'Cement Factory, community water supply projects in Sekota, Woldia, Negele, Shire, '
            'and Asayita, and healthcare facility rehabilitation works — demonstrating our range '
            'across sectors and project types.'
        )
        about.stats = [
            {'label': 'Years in Business', 'value': '12', 'suffix': '+'},
            {'label': 'Projects Completed', 'value': '10', 'suffix': '+'},
            {'label': 'Team Members', 'value': '10', 'suffix': ''},
            {'label': 'Repeat Clients', 'value': '6', 'suffix': '+'},
        ]
        about.save()

        for order, value in enumerate(CORE_VALUES):
            block, _ = AboutBlock.objects.update_or_create(
                title=value['title'],
                defaults={
                    'body': value['description'],
                    'icon': value['icon'],
                    'display_order': order,
                    'is_visible': True,
                },
            )

        self.stdout.write('Seeding quality & safety section...')
        quality = get_singleton(QualitySafetyContent)
        quality.heading = 'Quality, Safety & Sustainability'
        quality.introduction = (
            'Quality, safety, and sustainability are not add-ons to our construction process — '
            'they are part of how we work on every project. From the first site assessment to '
            'final handover, we follow systematic commitments designed to protect our clients, '
            'our workers, the public, and the environment.'
        )
        quality.quality_assurance = (
            'Compliance with project drawings, specifications, and applicable standards. '
            'Material checks on delivery and before use. Stage-by-stage inspections throughout '
            'construction. Testing of materials, installations, and completed works. Corrective '
            'actions when inspections identify non-conformances. Final handover inspections '
            'before project sign-off.'
        )
        quality.safety_practices = (
            'Risk assessments before commencing site activities. Personal protective equipment '
            '(PPE) provided and enforced. Worker training and site safety briefings. Safe site '
            'operations and signage. Emergency procedures and first-aid readiness. Ongoing '
            'safety monitoring throughout the project.'
        )
        quality.environmental_practices = (
            'Responsible waste disposal and segregation. Dust and noise control measures. '
            'Pollution prevention on and around sites. Efficient use of water and energy. '
            'Responsible sourcing of materials. Site restoration upon project completion.'
        )
        quality.commitments = [
            {
                'icon': 'ClipboardCheck',
                'title': 'Quality Assurance',
                'description': (
                    'Compliance with project drawings, specifications, and applicable standards\n'
                    'Material checks on delivery and before use\n'
                    'Stage-by-stage inspections throughout construction\n'
                    'Testing of materials, installations, and completed works\n'
                    'Corrective actions when inspections identify non-conformances\n'
                    'Final handover inspections before project sign-off'
                ),
            },
            {
                'icon': 'HardHat',
                'title': 'Health & Safety',
                'description': (
                    'Risk assessments before commencing site activities\n'
                    'Personal protective equipment (PPE) provided and enforced\n'
                    'Worker training and site safety briefings\n'
                    'Safe site operations and signage\n'
                    'Emergency procedures and first-aid readiness\n'
                    'Ongoing safety monitoring throughout the project'
                ),
            },
            {
                'icon': 'Leaf',
                'title': 'Environmental Responsibility',
                'description': (
                    'Responsible waste disposal and segregation\n'
                    'Dust and noise control measures\n'
                    'Pollution prevention on and around sites\n'
                    'Efficient use of water and energy\n'
                    'Responsible sourcing of materials\n'
                    'Site restoration upon project completion'
                ),
            },
            {
                'icon': 'Users',
                'title': 'Community Responsibility',
                'description': (
                    'Local employment opportunities on projects\n'
                    'Skills development and on-site training\n'
                    'Support for local suppliers and service providers\n'
                    'Respect for local communities and customs\n'
                    'Fair labour practices\n'
                    'Minimising disruption to surrounding areas'
                ),
            },
        ]
        quality.save()

        self.stdout.write('Seeding contact settings...')
        contact = get_singleton(ContactSettings)
        contact.heading = 'Contact Our Team'
        contact.description = (
            'Have a construction or civil engineering project in mind? Speak with our team about '
            'your requirements, site conditions, and timeline.'
        )
        contact.city = 'Adama'
        contact.region = 'Oromia'
        contact.country = 'Ethiopia'
        contact.phone = '+251 910 256 686'
        contact.email = 'civiljob12@gmail.com'
        contact.inquiry_recipient = 'civiljob12@gmail.com'
        contact.form_note = (
            'Required fields are marked with an asterisk. Your details are used only to respond '
            'to this inquiry.'
        )
        contact.save()

        self.stdout.write('Seeding footer settings...')
        footer = get_singleton(FooterSettings)
        footer.description = (
            'General construction and civil engineering company based in Adama, Oromia, Ethiopia. '
            'Building Excellence, Delivering Trust.'
        )
        footer.columns = [
            {
                'heading': 'Navigation',
                'links': [
                    {'label': 'Home', 'url': '/'},
                    {'label': 'About Us', 'url': '/about'},
                    {'label': 'Services', 'url': '/services'},
                    {'label': 'Projects', 'url': '/projects'},
                    {'label': 'Quality & Safety', 'url': '/quality-safety'},
                    {'label': 'Our Team', 'url': '/team'},
                    {'label': 'Contact', 'url': '/contact'},
                ],
            },
            {
                'heading': 'Services',
                'links': [
                    {'label': s['short_name'], 'url': f"/services/{s['slug']}"} for s in SERVICES
                ],
            },
        ]
        footer.contact_details = [
            {'label': 'Phone', 'value': '+251 910 256 686', 'href': 'tel:+251910256686'},
            {'label': 'Email', 'value': 'civiljob12@gmail.com', 'href': 'mailto:civiljob12@gmail.com'},
            {'label': 'Location', 'value': 'Adama, Oromia, Ethiopia', 'href': ''},
        ]
        footer.copyright_text = '© {year} Jobale Engineering PLC. All rights reserved.'
        footer.legal_links = [
            {'label': 'Privacy Policy', 'url': '/privacy'},
            {'label': 'Terms of Service', 'url': '/terms'},
        ]
        footer.show_replay_intro = True
        footer.save()

        self.stdout.write('Seeding SEO settings...')
        seo = get_singleton(SEOSettings)
        seo.page_title = (
            'Jobale Engineering PLC | Construction & Civil Engineering in Adama, Ethiopia'
        )
        seo.meta_description = (
            'General construction and civil engineering company in Adama, Ethiopia. Building '
            'construction, civil infrastructure, water supply, renovation, and maintenance '
            'services.'
        )
        seo.social_title = 'Jobale Engineering PLC — Building Excellence, Delivering Trust.'
        seo.social_description = (
            'From building construction to civil infrastructure, Jobale Engineering delivers '
            'practical engineering solutions grounded in quality, safety, and lasting value.'
        )
        seo.keywords = (
            'construction company Ethiopia, civil engineering Adama, general contractor Oromia, '
            'water supply construction, building construction Ethiopia'
        )
        seo.save()

        self.stdout.write('Seeding navigation...')
        for label, url, order in NAVIGATION:
            NavigationItem.objects.update_or_create(
                label=label,
                defaults={
                    'url': url,
                    'display_order': order,
                    'is_visible': True,
                    'is_external': url.startswith('http'),
                    'status': 'published',
                },
            )

        self.stdout.write('Seeding project categories...')
        for order, (name, description) in enumerate(CATEGORIES):
            ProjectCategory.objects.update_or_create(
                name=name,
                defaults={
                    'slug': slugify(name),
                    'description': description,
                    'display_order': order,
                    'is_active': True,
                },
            )

        self.stdout.write('Seeding services...')
        for order, payload in enumerate(SERVICES):
            data = dict(payload)
            url = data.pop('image')
            service, _ = Service.objects.update_or_create(
                slug=data['slug'],
                defaults={
                    **{k: v for k, v in data.items() if k != 'slug'},
                    'display_order': order,
                    'status': 'published',
                    'is_featured': True,
                },
            )
            self._assign_image(service, 'image', url)
            service.save()

        self.stdout.write('Seeding projects...')
        for order, payload in enumerate(PROJECTS):
            data = dict(payload)
            url = data.pop('image')
            featured = data.pop('featured')
            category_name = data.pop('category')
            category = ProjectCategory.objects.filter(name=category_name).first()
            project, _ = Project.objects.update_or_create(
                slug=data['slug'],
                defaults={
                    **data,
                    'category': category,
                    'category_name': category_name,
                    'display_order': order,
                    'status': 'published',
                    'is_featured': featured,
                    'is_verified': True,
                    'project_status': 'Completed',
                },
            )
            self._assign_image(project, 'image', url)
            project.save()

        self.stdout.write('Seeding website section registry...')
        for key, label, description, order, icon in PAGE_SECTIONS:
            PageSection.objects.update_or_create(
                key=key,
                defaults={
                    'label': label,
                    'description': description,
                    'display_order': order,
                    'icon': icon,
                    'is_enabled': True,
                },
            )

        self.stdout.write(self.style.SUCCESS('CMS seeded successfully.'))
        self.stdout.write('Next: python manage.py create_cms_admin')
