function Usuarios() {
  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Controle de Usuários</h2>
      <p className="text-gray-700 mb-6">
        Adicione novos usuários, consulte perfis, edite informações e gerencie o status de acesso.
      </p>

      {/* Exemplo de tabela simples */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 text-left">Nome</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="p-2">João Silva</td>
              <td className="p-2">joao@empresa.com</td>
              <td className="p-2 text-green-600">Ativo</td>
            </tr>
            <tr className="border-t">
              <td className="p-2">Maria Souza</td>
              <td className="p-2">maria@empresa.com</td>
              <td className="p-2 text-red-600">Inativo</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Usuarios;