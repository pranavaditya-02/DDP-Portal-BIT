



ref_approval_type
ref_approval_type_short
ref_category_sharing
ref_coe_type
ref_consultancy_category
ref_consultancy_type
ref_core_sector
ref_course_type
ref_doc_type
ref_duration_unit
ref_e_content_type
ref_event_level
ref_event_mode
ref_event_type_attended
ref_event_type_organized
ref_external_examiner_purpose
ref_financial_assistance
ref_fund_type
ref_industry_org_type
ref_industry_project_type
ref_iqac_status
ref_irp_interaction_mode
ref_irp_points_discussed
ref_irp_purpose
ref_journal_indexing
ref_lab_layout_type
ref_membership_category
ref_membership_level
ref_membership_type
ref_membership_validity_type
ref_mou_based_on
ref_mou_duration_unit
ref_mou_purpose
ref_mou_type
ref_newsletter_category
ref_organizer_type
ref_programme_level
ref_recognition_type
ref_resource_person_category
ref_scope_of_work
ref_sector_type
ref_sponsorship_type
ref_technical_society
ref_technical_society_status
ref_training_event_type
ref_training_mode
ref_visit_source
ref_vip_category
ref_vip_event_type
ref_year_of_study




-- Seed lookup/dropdown tables
-- Uses INSERT IGNORE so reruns do not fail on UNIQUE(label)

START TRANSACTION;

INSERT IGNORE INTO `ref_approval_type` (`label`) VALUES
('Apex'), ('Non-Apex'), ('Dean'), ('Principal');

INSERT IGNORE INTO `ref_approval_type_short` (`label`) VALUES
('Apex'), ('Principal'), ('Dean');

INSERT IGNORE INTO `ref_category_sharing` (`label`) VALUES
('60:40'), ('70:30');

INSERT IGNORE INTO `ref_coe_type` (`label`) VALUES
('Industry Sponsored Lab'), ('Industry Supported Lab');

INSERT IGNORE INTO `ref_consultancy_category` (`label`) VALUES
('Service Based'), ('Product Based');

INSERT IGNORE INTO `ref_consultancy_type` (`label`) VALUES
('Industry'), ('Institute');

INSERT IGNORE INTO `ref_core_sector` (`label`) VALUES
('Manufacturing'),
('Consulting'),
('Supply Chain Management'),
('Healthcare'),
('Technology'),
('Non-Profit (Public Service)'),
('Research'),
('Start Ups'),
('UG Student Project'),
('PG Student Project');

INSERT IGNORE INTO `ref_course_type` (`label`) VALUES
('AICTE'),
('CEC'),
('CISCO'),
('COURSERA'),
('edX'),
('GOOGLE'),
('IBM'),
('IGNOU'),
('IIMB'),
('INI'),
('NITTTR'),
('MICROSOFT'),
('NMEICT'),
('NPTEL'),
('SWAYAM'),
('ICMR'),
('UDEMY'),
('UGC'),
('AICTE QIP PG certificate Programme'),
('AI Infinity'),
('Oracle'),
('Other');

INSERT IGNORE INTO `ref_doc_type` (`label`) VALUES
('document_proof'),
('apex_proof'),
('certificate_proof'),
('geotag_photos'),
('syllabus'),
('course_feedback'),
('proceedings_proof'),
('relevant_proof'),
('marksheet_proof'),
('fdp_proof'),
('photo_proof'),
('award_proof'),
('sample_photographs');

INSERT IGNORE INTO `ref_duration_unit` (`label`) VALUES
('Year'), ('Month'), ('Day');

INSERT IGNORE INTO `ref_e_content_type` (`label`) VALUES
('PERSONALIZED_SKILL (PS)'),
('TUTORIAL'),
('E-BOOK'),
('VIDEO LECTURES'),
('ACADEMIC BOOK'),
('ASSESSMENT'),
('ARTICLE'),
('BLOG WRITING'),
('COURSE BOARD GRAPHICS'),
('DATABASE CREATION'),
('E-LEARNING GAME'),
('NPTEL TRANSLATION'),
('PODCAST'),
('SKILL-SCOURCE-BOOK'),
('YOUTUBE-VIDEO'),
('MAGAZINE'),
('NEW METHODOLOGY IN TLP/ASSESSMENT'),
('NEW COURSE IN CURICULLAM'),
('Other');

INSERT IGNORE INTO `ref_event_level` (`label`) VALUES
('State'), ('National'), ('International'), ('Institute (BIT)');

INSERT IGNORE INTO `ref_event_mode` (`label`) VALUES
('Online'), ('Offline'), ('Hybrid');

INSERT IGNORE INTO `ref_event_type_attended` (`label`) VALUES
('Certificate course'),
('Conference attended-without presentation'),
('Educational fair'),
('Faculty exchange programme'),
('FDP'),
('Guest Lecture'),
('Non-technical events'),
('One credit course'),
('Orientation programme'),
('Seminar'),
('Session chair'),
('STTP'),
('Summer School'),
('Training'),
('Value-Added course'),
('Webinar'),
('Winter School'),
('Workshop'),
('Hands-On Training'),
('PS-Certification (BIT)'),
('NPTEL-FDP'),
('AICTE-UHV-FDP'),
('Innovation Ambassador- IIC Certificate'),
('CEE-ACO & BEI panelist workshop certificate'),
('Other');

INSERT IGNORE INTO `ref_event_type_organized` (`label`) VALUES
('HRD Programs'),
('Certificate course'),
('Partial Delivery of Course'),
('Competitions for BIT students'),
('Conference'),
('Faculty training Program'),
('FDP/STTP'),
('Guest Lecture'),
('Hands on training'),
('Leader of the Week'),
('Non Technical Event'),
('One credit course'),
('Orientation program'),
('Refresher Program'),
('Seminar'),
('Technical Events'),
('Webinar'),
('Workshop'),
('Non-Teaching training programme'),
('Others'),
('Symposium'),
('Interaction');

INSERT IGNORE INTO `ref_external_examiner_purpose` (`label`) VALUES
('Central Valuation'),
('Flying Squad'),
('Hall invigilator'),
('Practical/Project viva External Examiner'),
('Question Paper Scrutiny'),
('QP Setter'),
('University Representative');

INSERT IGNORE INTO `ref_financial_assistance` (`label`) VALUES
('Self'), ('Management'), ('NA');

INSERT IGNORE INTO `ref_fund_type` (`label`) VALUES
('Self'), ('Management'), ('Funding Agency');

INSERT IGNORE INTO `ref_industry_org_type` (`label`) VALUES
('MNC'), ('Large Scale'), ('MSME'), ('Small Scale'), ('Others');

INSERT IGNORE INTO `ref_industry_project_type` (`label`) VALUES
('Product'), ('Process');

INSERT IGNORE INTO `ref_iqac_status` (`label`) VALUES
('Initiated'), ('Approved'), ('Rejected');

INSERT IGNORE INTO `ref_irp_interaction_mode` (`label`) VALUES
('Email'),
('Visit to Company Premises'),
('Within BIT'),
('Phone Call'),
('Others');

INSERT IGNORE INTO `ref_irp_points_discussed` (`label`) VALUES
('Placement'),
('Internship'),
('One Credit Course'),
('Student Project'),
('Curriculum Feedback'),
('Guest Lecture'),
('Board of Studies'),
('Workshop/Seminar'),
('Faculty Training'),
('Student Industrial Visit'),
('Laboratory Enhancement'),
('Skill Training'),
('Industry Defined Problem'),
('Joint Funding Proposals'),
('Joint IPR Activity'),
('Product Development'),
('Teaching Materials'),
('Sponsorship'),
('Funding'),
('Others');

INSERT IGNORE INTO `ref_irp_purpose` (`label`) VALUES
('Industry Interaction'),
('Field Visit'),
('Exhibition'),
('IECC Planned Activity'),
('Pskill');

INSERT IGNORE INTO `ref_journal_indexing` (`label`) VALUES
('Scopus'), ('Web of Science'), ('SCI'), ('Others');

INSERT IGNORE INTO `ref_lab_layout_type` (`label`) VALUES
('New Layout'), ('Modified Layout');

INSERT IGNORE INTO `ref_membership_category` (`label`) VALUES
('Institute Membership'), ('Faculty Membership');

INSERT IGNORE INTO `ref_membership_level` (`label`) VALUES
('National'), ('International');

INSERT IGNORE INTO `ref_membership_type` (`label`) VALUES
('Annual'), ('Lifetime');

INSERT IGNORE INTO `ref_membership_validity_type` (`label`) VALUES
('Self'), ('BIT'), ('Others');

INSERT IGNORE INTO `ref_mou_based_on` (`label`) VALUES
('Industry'), ('Institute');

INSERT IGNORE INTO `ref_mou_duration_unit` (`label`) VALUES
('Years'), ('Months');

INSERT IGNORE INTO `ref_mou_purpose` (`label`) VALUES
('Internship'),
('Centre of Excellence'),
('Faculty Training'),
('World Skills Training'),
('Certification Course'),
('Placement Training'),
('Collaborative Projects'),
('Laboratory Enhancement'),
('Consultancy'),
('Sharing Facilities'),
('Product Development'),
('Publications'),
('Funding'),
('Patents'),
('Organizing Events'),
('Student Projects'),
('One-Credit Course'),
('Placement Offers'),
('Syllabus Framing for Curriculum'),
('Syllabus Framing for One Credit'),
('Student Training'),
('Others');

INSERT IGNORE INTO `ref_mou_type` (`label`) VALUES
('National'), ('International');

INSERT IGNORE INTO `ref_newsletter_category` (`label`) VALUES
('Department Newsletter'), ('Institution Newsletter');

INSERT IGNORE INTO `ref_organizer_type` (`label`) VALUES
('BIT'),
('Industry'),
('Foreign Institute'),
('Institute in India'),
('Others');

INSERT IGNORE INTO `ref_programme_level` (`label`) VALUES
('UG'), ('PG');

INSERT IGNORE INTO `ref_recognition_type` (`label`) VALUES
('Reviewer'),
('Editorial Board Member'),
('Editor in Chief'),
('Advisory board Member'),
('Others');

INSERT IGNORE INTO `ref_resource_person_category` (`label`) VALUES
('BoS Member'),
('Chief Guest'),
('Conference Session Chair'),
('DC member'),
('Energy Audit'),
('Examiner - Ph.D Viva voce'),
('External Academic Audit'),
('Internal Academic Audit'),
('Jury member'),
('Quality Expert'),
('Technical Expert'),
('Thesis Evaluator'),
('Interaction'),
('Panel-Member');

INSERT IGNORE INTO `ref_scope_of_work` (`label`) VALUES
('Testing Service using Instrument Facility'),
('Product Development'),
('Hardware Module Prototype Design'),
('Software Testing'),
('Software Design'),
('Software Application Development'),
('Self-Knowledge Transfer');

INSERT IGNORE INTO `ref_sector_type` (`label`) VALUES
('Private'), ('Government');

INSERT IGNORE INTO `ref_sponsorship_type` (`label`) VALUES
('Self'), ('BIT'), ('Funding Agency'), ('Others');

INSERT IGNORE INTO `ref_technical_society` (`label`) VALUES
('IEEE'), ('CSI'), ('IAENG'), ('SAE'), ('etc.');

INSERT IGNORE INTO `ref_technical_society_status` (`label`) VALUES
('Active'), ('Non-Active');

INSERT IGNORE INTO `ref_training_event_type` (`label`) VALUES
('Conference'), ('Workshop'), ('Industry Training'), ('Seminar'), ('Others');

INSERT IGNORE INTO `ref_training_mode` (`label`) VALUES
('Online'), ('Offline');

INSERT IGNORE INTO `ref_visit_source` (`label`) VALUES
('Self'), ('Department'), ('Special Lab'), ('Institute');

INSERT IGNORE INTO `ref_vip_category` (`label`) VALUES
('FAA'), ('Events'), ('R&D');

INSERT IGNORE INTO `ref_vip_event_type` (`label`) VALUES
('Workshop'),
('Seminar'),
('Conference'),
('Symposium'),
('Value Added Course'),
('One Credit Course'),
('Non-Technical Events'),
('Technical Events'),
('Special Programs'),
('Leader of the Week'),
('Guest Lecture'),
('Placement Visit'),
('FDP/SDP'),
('Certificate Course'),
('Other');

INSERT IGNORE INTO `ref_year_of_study` (`label`) VALUES
('First'), ('Second'), ('Third'), ('Fourth');

COMMIT;