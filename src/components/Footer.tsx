import Link from 'next/link';

export default function Footer() {
  const bchAddress = "qrmyh2x674uka3jls0rwv7rnpwgty2kr3ckagu7ltu";

  return (
    <footer className="bg-gray-800 text-white mt-12">
      <div className="container mx-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-2">About</h3>
            <p className="text-gray-400">
              A community-driven platform for discovering and sharing quality content about Bitcoin Cash (BCH).
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-2">Connect</h3>
            <ul>
              <li>
                <Link href="https://t.me/+OvqF4keZcTYwMmNh" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300">
                  Canal Telegram
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-2">Support Us</h3>
            <p className="text-gray-400 text-sm">
              ¡Apoya mi labor en la difusión de las ideas de Bitcoin Cash, la defensa de la libertad y la promoción de tecnologías descentralizadas! Tu donación impulsa la creación de contenido educativo y eventos para un futuro más libre.
            </p>
            <div className="mt-2 text-xs break-all bg-gray-900 p-2 rounded">
              <p>Apoya este video comprándome un café con Bitcoin Cash:</p>
              <code>{bchAddress}</code>
            </div>
          </div>
        </div>
        <div className="text-center text-gray-500 pt-8 mt-8 border-t border-gray-700">
          <p>&copy; {new Date().getFullYear()} BCH Content Hub. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
