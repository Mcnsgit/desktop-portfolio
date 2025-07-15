import React from 'react';
import About from './About';
import Tech from './Tech';
import Experience from './Experience';
import Works from './Works';
import Contact from './Contact';

const CvView = () => {
    return (
        <div className="cv-view">

            <div id="about">
                <About />
            </div>
            <div id="skills">
                <Tech />
            </div>
            <div id="work-experience">
                <Experience />
            </div>
            <div id="work-projects">
                <Works />
            </div>
            <div id="contact">
                <Contact />
            </div>
        </div>
    )
}

export default CvView;