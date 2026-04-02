import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IconParceiro, IconProduto, IconServico } from "./icons/Icons";
import "./css/cadastro.css";

interface Solicitacao {
  id: number;
  nuCad: string;
  nomeUsu: string;
  razaoSocialParc?: string;
  descrServ?: string;
  codgrupo?: string;
  codservico?: number | null;
  codGrupoProd?:number;
  status: "A" | "F";
  codUsuSol: string;
  descricaoGrupo: string;
  descrGrupoProd: string;
  complementodescricao?: string;
  descGrupoProd?: string;
  dataini?: string;
  codUsuSolNome?: string;
  nomeComercial?: string;
  marca?: string;
  grupoProd?: string;
  cnpjCpf?: string;
  telefone?: string;

  grupo?: {
    descricao: string;
    descgrupprod?: string;
  };

  user?: {
    nomeUsu: string;
  };
    produto?: {
    descricaoprod: string;
  };

}

const COLUMN_CONFIG = {
  Produto: [
    { label: "Nro. Solicitação", key: "nuCad" },
    { label: "Nome Comercial", key: "nomeComercial" },
    //{ label: "Marca", key: "marca" },
    { label: "Grupo", key: "descGrupoProd" },
    { label: "Status", key: "status" },
    { label: "Data", key: "dataini" },
    { label: "Solicitante", key: "codUsuSolNome" },
    { label: "Ações", key: "acoes" },
  ],
  Parceiro: [
    { label: "Nro. Solicitação", key: "nuCad" },
    { label: "Razão Social", key: "razaoSocialParc" },
    { label: "CNPJ/CPF", key: "cnpjCpf" },
    { label: "Telefone", key: "telefone" },
    { label: "Status", key: "status" },
    { label: "Data", key: "dataini" },
    { label: "Solicitante", key: "codUsuSolNome" },
    { label: "Ações", key: "acoes" },
  ],
  Servico: [
    { label: "Nro. Solicitação", key: "nuCad" },
    { label: "Descrição do Serviço", key: "descrServ" },
    { label: "Cód Grupo", key: "codGrupoProd" },
    { label: "Descrição do Grupo", key: "descrGrupoProd" },
    { label: "Status", key: "status" },
    { label: "Solicitante", key: "codUsuSolNome" },
    { label: "Ações", key: "acoes" },
  ],
};

function Cadastros() {
  const [pagina, setPagina] = useState(1);
  const [temMais, setTemMais] = useState(true);

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const [openModal, setOpenModal] = useState(false);
  const navigate = useNavigate();

  const [resultados, setResultados] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(false);

  const handleNavigate = (path: string) => {
    setOpenModal(false);
    navigate(path);
  };

  const [filters, setFilters] = useState({
    search: "",
    tipo: "Produto",
    status: "Todas"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = document.documentElement.scrollTop;
      const clientHeight = document.documentElement.clientHeight;

      // Detecta se faltam 100px para o final da página 
      if (scrollTop + clientHeight >= scrollHeight - 100) {
        handleSearch(false); // Carrega a próxima página
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pagina, loading, temMais, filters]); // Dependências cruciais [cite: 8]

  const handleSearch = async (isNewSearch = true) => {
    if (loading || (!temMais && !isNewSearch)) return;

    if (isNewSearch) {
      setLoading(true);
      setResultados([]); // Limpa a tabela para não misturar dados novos com antigos
      setPagina(1);      // Reseta para a primeira página
      setTemMais(true);  // Permite que o scroll funcione novamente
      setShowAlert(false);
    } else {
      setLoading(true);
    }
    const novaPagina = isNewSearch ? 1 : pagina + 1;

    const payload = {
      ...filters,
      page: novaPagina.toString(),
      status: filters.status === "Todos" ? "" : filters.status,
      search: filters.search.trim()
    };

    const queryParams = new URLSearchParams(payload).toString();
    console.log("Dados enviados para a API:", payload); // Log dos parâmetros para debug

    try {
      const response = await fetch(`http://127.0.0.1:3333/register/?${queryParams}`);
      //if (!response.ok) throw new Error("Erro no servidor");

      const dados = await response.json();
      console.log("Dados recebidos do backend:", dados);
      const novosItens = Array.isArray(dados) ? dados : (dados.data || []);

      if (isNewSearch) {
        setResultados(novosItens);
        setPagina(1);
        setTemMais(novosItens.length > 0);
      } else {
        setResultados(prev => [...prev, ...novosItens]); // Anexa os novos dados 
        setPagina(novaPagina);
      }

      // Se a API trouxer menos itens que o limite (ex: 10), paramos o scroll [cite: 11]
      setTemMais(novosItens.length > 0);

      if (novosItens.length === 0 && isNewSearch) {
        setAlertMessage("Nenhum dado encontrado.");
        setShowAlert(true);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (item: Solicitacao) => {
    const tipoFormatado = filters.tipo.toLowerCase();
    const modo = item.status === "F" ? "view" : "edit";
    navigate(`/${tipoFormatado}/${modo}/${item.nuCad}`);
  };

  useEffect(() => {
    setResultados([]);
    setPagina(1);
    setTemMais(true);
  }, [filters.tipo]);

  const renderCell = (item: Solicitacao, key: string) => {
    switch (key) {

      case "nuCad":
        return item.nuCad;

      case "descricaoprod":
        return item.produto?.descricaoprod || "<N/A>";

      case "marca":
        return item.marca || "<N/A>";

      case "descrGrupoProd":
        return item.descrGrupoProd || "<N/A>";

      case "razaoSocialParc":
        return item.razaoSocialParc || "<N/A>";

      case "cnpjCpf":
        return item.cnpjCpf || "<N/A>";

      case "telefone":
        return item.telefone || "<N/A>";

      case "descrServ":
        return item.descrServ || "<N/A>";

      case "codGrupoProd":
        return item.codGrupoProd || "<N/A>";

      case "descGrupoProd":
        return item.descGrupoProd || "OUTRAS PEÇAS";

      case "nomeComercial":
        return item.nomeComercial || "<N/A>";

      // removed duplicate case; use descricaoGrupo instead

      case "status":
        return (
          <span className={`badge ${item.status === "F" ? "badge-finalizada" : "badge-aberta"}`}>
            {item.status === "A" ? "Aberta" : "Finalizada"}
          </span>
        );

      case "dataini":
        return item.dataini
          ? new Date(item.dataini).toLocaleDateString()
          : "<N/A>";

      case "codUsuSolNome":
        return `${item.codUsuSol} - ${item.codUsuSolNome || ""}`;

      case "acoes":
        return (
          <button
            className={`btn-icon-edit ${item.status === "F" ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={item.status === "F"}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/${filters.tipo.toLowerCase()}/edit/${item.nuCad}`);
            }}
          >
            Editar
          </button>
        );

      default:
        return null;
    }
  };

  return (
    <div className="cadastros-container relative">
      {showAlert && (
        <div className="fixed top-5 right-5 z-50 animate-bounce">
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 shadow-lg rounded flex items-center space-x-3" role="alert">
            <svg className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="font-bold">Atenção</p>
              <p className="text-sm">{alertMessage}</p>
            </div>
            <button onClick={() => setShowAlert(false)} className="ml-auto text-yellow-700 hover:text-yellow-900">
              <span className="text-2xl">&times;</span>
            </button>
          </div>
        </div>
      )}
      <h2 className="cadastros-title">Consulta de Solicitações</h2>

      <p className="cadastros-subtitle">
        Gerencie e consulte solicitações cadastradas no sistema
      </p>

      {/* Filtros de Busca */}
      <div className="cadastros-card">
        <h3>Filtros de Busca</h3>

        <form className="cadastros-form">
          <div>
            <label className="cadastros-label">Filtrar por</label>
            <input
              name="search"
              value={filters.search}
              onChange={handleChange}
              type="text"
              className="cadastros-input"
              placeholder="Nro. Solicitação ou Nome"
            />
          </div>

          {/* Tipo de Cadastro */}
          <div>
            <label className="cadastros-label">Tipo de Cadastro</label>
            <select className="cadastros-select" name="tipo" value={filters.tipo} onChange={handleChange}>
              <option value="Produto">Produto</option>
              <option value="Parceiro">Parceiro</option>
              <option value="Servico">Serviço</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="cadastros-label">Status</label>
            <select className="cadastros-select" name="status" value={filters.status} onChange={handleChange} >
              <option value={"Todos"}>Todas</option>
              <option value={"Abertas"}>Abertas</option>
              <option value={"Finalizadas"}>Finalizadas</option>
            </select>
          </div>
        </form>

        {/* Botões */}
        <div className="cadastros-buttons">
          <button type="button" className="btn-primary" onClick={() => handleSearch(true)}>
            Buscar
          </button>

          <button
            type="button"
            onClick={() => setOpenModal(true)}
            className="btn-secondary"
          >
            + Solicitar
          </button>
        </div>
      </div>

      {/* Resultado */}
      <div className="mt-6 overflow-hidden rounded-lg bg-white shadow-md">
        <div className="table-container">
          {/* Barra de aviso baseada na imagem */}
          <div className="overflow-x-auto">
            <table className="cadastros-table">
              <thead>
                <tr>
                  {COLUMN_CONFIG[filters.tipo as keyof typeof COLUMN_CONFIG].map((col) => (
                    <th key={col.key} className={col.key === "acoes" ? "text-center" : ""}>
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {resultados.map((item, index) => (
                  <tr
                    key={`${item.nuCad}-${index}`}
                    onClick={() => handleRowClick(item)}
                    className="hover:bg-blue-50 cursor-pointer transition-colors duration-200"
                  >
                    {COLUMN_CONFIG[filters.tipo as keyof typeof COLUMN_CONFIG].map((col) => (
                      <td
                        key={col.key}
                        className={col.key === "acoes" ? "td-actions" : ""}
                      >
                        {renderCell(item, col.key)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {loading && resultados.length > 0 && (
              <div className="flex justify-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Carregando mais...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {openModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">
              Escolha o Tipo de Solicitação
            </h3>

            <div className="modal-buttons">
              <button
                onClick={() => handleNavigate("/produto")}
                className="modal-btn-option"
              >
                <IconProduto className="w-6 h-6" />
                <span>Produto</span>
              </button>

              <button
                onClick={() => handleNavigate("/parceiro")}
                className="modal-btn-option"
              >
                <IconParceiro className="w-6 h-6" />
                <span>Parceiro</span>
              </button>

              <button
                onClick={() => handleNavigate("/servico")}
                className="modal-btn-option"
              >
                <IconServico className="w-6 h-6" />
                <span>Serviço</span>
              </button>
            </div>

            <button
              onClick={() => setOpenModal(false)}
              className="modal-cancel"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cadastros;