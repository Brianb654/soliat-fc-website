import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about-container">
      <section className="intro">
        <h2>About Soliat FC</h2>
        <p>
          Soliat FC is a grassroots football club based in Ainabkoi, passionate about nurturing
          talent, uniting the local community, and inspiring young athletes to dream big through the beautiful game.
        </p>
      </section>

      <section className="mission-vision">
        <h3>Our Mission</h3>
        <p>To develop future champions by providing a structured platform for training, growth, and competition.</p>

        <h3>Our Vision</h3>
        <p>To become a model community club known for talent development, discipline, and community impact in Kenya and beyond.</p>
      </section>

      <section className="history">
        <h3>Our Story</h3>
        <p>
          Founded in 2022, Soliat FC began with a handful of local players and a dream to put Ainabkoi on the football map.
          Over the years, we've grown into a team recognized for its discipline, teamwork, and consistent performance in the local league.
        </p>
      </section>

      <section className="achievements">
        <h3>Achievements</h3>
        <ul>
          <li>🏆 2023 Ainabkoi Sub Branch League Semifinalists</li>
          <li>🥇 Undefeated streak – 10 consecutive matches in 2024 season</li>
          <li>🌍 Over 20 youth players scouted into national tournaments</li>
        </ul>
      </section>

      <section className="community">
        <h3>Community Engagement</h3>
        <p>
          We organize school outreach programs, community clean-ups, and talent clinics in local schools.
          Our players serve as role models and mentors to upcoming stars in the region.
        </p>
      </section>

      <section className="call-to-action">
        <h3>Support Us</h3>
        <p>
          Help us continue changing lives through football. Sponsor a kit, donate training equipment, or simply
          attend our matches and cheer us on!
        </p>
        <a href="/contact" className="about-button">📞 Get In Touch</a>
      </section>
    </div>
  );
};

export default About;
