import About from "./(app)/components/about";
import Contact from "./(app)/components/contact";
import Footer from "./(app)/components/footer";
import Hero from "./(app)/components/hero";
import Navbar from "./(app)/components/navbar";
import Projects from "./(app)/components/projects";

export default function Home() {
  return (
    <>
      <Navbar />

      <main>
        <Hero />
        <About />
        <Projects />
        <Contact />
      </main>

      <Footer />
    </>
  );
}
