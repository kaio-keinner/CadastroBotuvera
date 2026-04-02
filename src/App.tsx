import { Routes, Route, Link } from "react-router-dom";
import Cadastros from "./Cadastros";
import Usuarios from "./Usuarios";
import CadastroProduto from "./CadastroProdutos";
import CadastroParceiro from "./CadastroParceiros";
import CadastroServicos from "./CadastroServicos";



function App() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Cabeçalho */}
      <header className="bg-white text-black h-20 flex items-center px-6 justify-between shadow-md">
        <img
          src="https://botuvera.com/wp-content/uploads/2021/10/logo-1-300x92.png.webp"
          alt="logo botuverá"
          className="h-12 w-auto object-contain"
        />
        <nav className="space-x-4">
          <Link to="/perfil" className="hover:underline">Perfil</Link>
        </nav>
      </header>

      {/* Corpo com rotas */}
      <main className="flex-grow p-8 bg-gray-100">
        <Routes>
          <Route path="/" element={
            <>
              <h2 className="text-2xl font-semibold mb-2">Módulos do Sistema</h2>
              <p className="text-gray-600 mb-8">Selecione o módulo que deseja acessar</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link to="/cadastros" className="bg-white rounded-lg shadow-xl p-6 hover:shadow-2xl transition">
                  <div className="flex items-center mb-4">
                    <span className="text-green-500 text-3xl">📋</span>
                    <h3 className="ml-3 text-lg font-bold">Solicitação de Cadastros</h3>
                  </div>
                  <p className="text-gray-700">
                    Consulte produtos, parceiros e serviços, e solicite a inclusão de novos itens.
                  </p>
                </Link>

                <Link to="/usuarios" className="bg-white rounded-lg shadow-xl p-6 hover:shadow-2xl transition">
                  <div className="flex items-center mb-4">
                    <span className="text-blue-500 text-3xl">👥</span>
                    <h3 className="ml-3 text-lg font-bold">Controle de Usuários</h3>
                  </div>
                  <p className="text-gray-700">
                    Adicione novos usuários, consulte perfis, edite informações e gerencie o status de acesso.
                  </p>
                </Link>
              </div>
            </>
          } />

          <Route path="/cadastros" element={<Cadastros />} />
          <Route path="/usuarios" element={<Usuarios />} />

          <Route path="/parceiro" element={<CadastroParceiro />} />
          <Route path="/produto" element={<CadastroProduto />} />
          <Route path="/servico" element={<CadastroServicos />} />

          <Route path="/produto/view/:id" element={<CadastroProduto mode="view" />} />
          <Route path="/parceiro/view/:id" element={<CadastroParceiro mode="view" />} />
          <Route path="/servico/view/:id" element={<CadastroServicos mode="view" />} />

          
          <Route path="/produto/edit/:id" element={<CadastroProduto mode="create" />} />
          <Route path="/parceiro/edit/:id" element={<CadastroParceiro mode="create" />} />
          <Route path="/servico/edit/:id" element={<CadastroServicos mode="create" />} />

        </Routes>
      </main>

      {/* Rodapé */}
      <footer className="bg-gray-200 text-black p-4 text-center shadow-md">
        <p>© 2026 - Desenvolvido por Kaio Keinner</p>
      </footer>
    </div>
  );
}

export default App;