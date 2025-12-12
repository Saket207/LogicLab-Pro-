import React from 'react';
import teacherPhoto from '../assets/teacher-photo.jpg';

const HelpModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="help-modal-overlay" onClick={handleOverlayClick}>
            <div className="help-modal-content">
                <button className="help-modal-close" onClick={onClose} aria-label="Close">
                    ×
                </button>

                <div className="help-modal-header">
                    <h2>Contact & Support</h2>
                </div>

                <div className="help-modal-body">
                    <div className="teacher-info-card">
                        <div className="teacher-photo-container">
                            <img
                                src={teacherPhoto}
                                alt="Professor SHASHANK S"
                                className="teacher-photo"
                            />
                        </div>

                        <div className="teacher-details">
                            <h3 className="teacher-name">SHASHANK S</h3>
                            <p className="teacher-title">Assistant Professor</p>
                            <p className="teacher-institution">Dayananda Sagar College of Engineering (DSCE)</p>

                            <div className="teacher-contact">
                                <div className="contact-item">
                                    <svg className="contact-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                        <polyline points="22,6 12,13 2,6" />
                                    </svg>
                                    <a href="mailto:shashank-csiot@dsce.edu.in" className="contact-link">
                                        shashank-csiot@dsce.edu.in
                                    </a>
                                </div>
                            </div>

                            <div className="help-description">
                                <p>For any questions, assistance, or support regarding the Logic Gate Simulator, please feel free to reach out via email.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HelpModal;
