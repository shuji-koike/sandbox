export default async function Page() {
  return (
    <main>
      {
        await new Promise<string>((resolve) =>
          setTimeout(() => resolve(`date: ${Date()}`), 1000)
        )
      }
    </main>
  );
}
