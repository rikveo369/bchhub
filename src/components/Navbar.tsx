import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="bg-gray-800 text-white">
      <nav className="container mx-auto flex items-center justify-between p-4">
        <div className="text-lg font-bold">
          <Link href="/">BCH Content Hub</Link>
        </div>
        <ul className="flex space-x-4">
          <li>
            <Link href="/" className="hover:text-gray-300">Home</Link>
          </li>
          <li>
            <Link href="/videos" className="hover:text-gray-300">BCH Videos</Link>
          </li>
          <li>
            <Link href="/blog" className="hover:text-gray-300">Blog</Link>
          </li>
          {/* A link to the admin dashboard for convenience */}
          <li>
            <Link href="/admin/channels" className="hover:text-gray-300 text-sm opacity-75">Admin</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
