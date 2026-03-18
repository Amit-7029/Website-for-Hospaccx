export const doctorPosters = Array.from({ length: 31 }, (_, index) => ({
  id: `poster-${index + 1}`,
  title: `Doctor Poster ${index + 1}`,
  src: `/images/DR ${index + 1}.jpeg`
}));
