export default async function Page({ params }: { params: { id: string } }) {
  const { id } = await params;
  return <h1>Task number: {id}</h1>;
}
