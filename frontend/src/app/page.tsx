export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold sm:text-6xl">
              Atlantic Proxy
            </h1>
            <p className="mt-4 text-xl opacity-90">
              Premium Proxy Solutions | Oxylabs Affiliate Partner
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <a href="/auth/register" className="btn btn-primary bg-white text-blue-600 hover:bg-gray-100">
                Get Started
              </a>
              <a href="/auth/login" className="btn btn-secondary border-white text-white hover:bg-white hover:text-blue-600">
                Sign In
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card p-6 text-center">
            <div className="text-3xl mb-4">🏠</div>
            <h3 className="text-lg font-semibold mb-2">Residential Proxies</h3>
            <p className="text-gray-600">100M+ real residential IPs worldwide</p>
          </div>
          <div className="card p-6 text-center">
            <div className="text-3xl mb-4">🏢</div>
            <h3 className="text-lg font-semibold mb-2">Datacenter Proxies</h3>
            <p className="text-gray-600">High-speed dedicated datacenter IPs</p>
          </div>
          <div className="card p-6 text-center">
            <div className="text-3xl mb-4">📱</div>
            <h3 className="text-lg font-semibold mb-2">Mobile Proxies</h3>
            <p className="text-gray-600">4G/5G mobile network IPs</p>
          </div>
        </div>
      </div>
    </div>
  )
}