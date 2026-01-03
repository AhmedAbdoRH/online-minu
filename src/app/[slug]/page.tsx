import ClientCatalogPage from "./ClientCatalogPage";

export async function generateStaticParams() {
  return [{ slug: '_' }];
}

export default function CatalogPage({ params }: { params: { slug: string } }) {
  return <ClientCatalogPage />;
}
