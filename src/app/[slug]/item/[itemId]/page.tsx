import ClientProductPage from "./ClientProductPage";

export async function generateStaticParams() {
  return [{ slug: '_', itemId: '_' }];
}

export default function ProductPage({ params }: { params: { slug: string, itemId: string } }) {
  return <ClientProductPage />;
}
