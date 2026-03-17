import "./styles.css";
import { blogPosts } from "./data/content";

document.getElementById("blogPageGrid").innerHTML = blogPosts
  .map(
    (post) => `
      <article class="resource-card">
        <p class="resource-card__eyebrow">${post.category} • ${post.readTime}</p>
        <h3>${post.title}</h3>
        <p>${post.excerpt}</p>
        <a href="/#appointment" class="resource-card__link">Speak with our team</a>
      </article>
    `
  )
  .join("");
