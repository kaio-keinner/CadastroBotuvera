import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

interface CadastroServicosProps {
    mode?: "create" | "view";
}

type SearchType = "grupo" | "unidade" | null;

interface FormDataState {
    codservico: string;
    codGrupo: string;          // só o código, separado
    descricaoGrupo: string;    // só a descrição, separada
    descricao: string;
    observacaoservico: string;
    unidade: string;
    codUnidade: string;
    descricaoUnidade: string;
    codUsuSol: string;
    solicitante: string;
    status: string;
}

// Campos obrigatórios e suas labels para mensagens de erro
const CAMPOS_OBRIGATORIOS: { campo: keyof FormDataState; label: string }[] = [
    { campo: "codservico", label: "Cód. Grupo de Serviço" },
    { campo: "descricao", label: "Descrição Serviço" },
];

type ErrosState = Partial<Record<keyof FormDataState, string>>;

function CadastroServicos({ mode = "create" }: CadastroServicosProps) {
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [searchType, setSearchType] = useState<SearchType>(null);

    const [dataAbertura, setDataAbertura] = useState("");
    const [horaAbertura, setHoraAbertura] = useState("");

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [erros, setErros] = useState<ErrosState>({});

    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isView = mode === "view";

    const [formData, setFormData] = useState<FormDataState>({
        codservico: "",
        codGrupo: "",
        descricaoGrupo: "",
        descricao: "",
        observacaoservico: "",
        unidade: "",
        codUnidade: "",
        descricaoUnidade: "",
        codUsuSol: "",
        solicitante: "",
        status: "",
    });

    // ─── Validação ────────────────────────────────────────────────────────────

    const validar = (): boolean => {
        const novosErros: ErrosState = {};

        CAMPOS_OBRIGATORIOS.forEach(({ campo, label }) => {
            if (!formData[campo]?.trim()) {
                novosErros[campo] = `${label} é obrigatório.`;
            }
        });

        setErros(novosErros);
        return Object.keys(novosErros).length === 0;
    };

    // Limpa erro do campo assim que o usuário preenche
    const limparErro = (campo: keyof FormDataState) => {
        if (erros[campo]) {
            setErros(prev => {
                const novo = { ...prev };
                delete novo[campo];
                return novo;
            });
        }
    };

    // ─── Submit ───────────────────────────────────────────────────────────────

    const handleSalvar = async () => {
        if (!validar()) return;
        
        setSaving(true);
        try {
            
            const payload = {
                codGrupo: formData.codGrupo,
                descricaoGrupo: formData.descricaoGrupo,
                descricao: formData.descricao,
                observacaoservico: formData.observacaoservico,
                codUnidade: formData.descricaoUnidade,
                descricaoUnidade: formData.codUnidade,
                dataIni: dataAbertura && horaAbertura ,
            };
            console.log(payload)
            const response = await fetch("http://127.0.0.1:3333/services", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            console.log(response)

            if (!response.ok) throw new Error("Erro ao salvar");

            navigate("/cadastros");
        } catch (error) {
            console.error("Erro ao salvar:", error);
            // Aqui você pode adicionar um toast de erro se quiser futuramente
            alert("Erro ao salvar o serviço. Tente novamente.");
        } finally {
            setSaving(false);
        }
    };

    // ─── Modal de busca ───────────────────────────────────────────────────────

    const abrirModal = (tipo: SearchType) => {
        setSearchType(tipo);
        setSearchResults([]);
        setSearchQuery("");
        setPage(1);
        setHasMore(true);
        setShowSearchModal(true);
    };

    const fecharModal = () => {
        setShowSearchModal(false);
        setSearchType(null);
        setSearchResults([]);
        setSearchQuery("");
        setPage(1);
        setHasMore(true);
    };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollTop + clientHeight >= scrollHeight - 20 && hasMore && !loading) {
            executarBusca(page + 1);
        }
    };

    const executarBusca = async (pagina = 1) => {
        if (loading) return;
        setLoading(true);
        try {
            const response = await fetch(
                `http://127.0.0.1:3333/services?search=${searchQuery}&type=${searchType}&page=${pagina}`
            );
            const result = await response.json();
            const novosDados = result.data || [];
            console.log(result);

            setSearchResults(prev => pagina === 1 ? novosDados : [...prev, ...novosDados]);
            setPage(pagina);
            if (result.meta.current_page >= result.meta.last_page) setHasMore(false);

        } catch (error) {
            console.error("Erro na busca:", error);
        } finally {
            setLoading(false);
        }
    };

    const selecionarItem = (item: any) => {
        const valorFormatado = `${item.codGrupoProd} - ${item.descrGrupoProd}`;

        if (searchType === "grupo") {
            setFormData(prev => ({
                ...prev,
                codservico: valorFormatado,
                codGrupo: String(item.codGrupoProd),
                descricaoGrupo: item.descrGrupoProd,
            }));
            limparErro("codservico");
        } else if (searchType === "unidade") {
            setFormData(prev => ({
                ...prev,
                unidade: valorFormatado,
                codUnidade: String(item.codGrupoProd),
                descricaoUnidade: item.descrGrupoProd,
            }));
        }

        fecharModal();
    };

    // ─── Consulta view ────────────────────────────────────────────────────────

    const consultarBanco = async (nroSolicitacao: string) => {
        setLoading(true);
        try {
            const response = await fetch(`http://127.0.0.1:3333/register/${nroSolicitacao}`);
            if (!response.ok) throw new Error("Erro ao buscar dados");

            const data = await response.json();

            setFormData({
                codservico: String(data.codservico || ""),
                codGrupo: String(data.codservico || ""),
                descricaoGrupo: data.descricaoGrupo || "",
                descricao: data.descricaoservico || "",
                observacaoservico: data.observacaoservico || "",
                unidade: data.unidade || "",
                codUnidade: data.codUnidade || "",
                descricaoUnidade: data.descricaoUnidade || "",
                codUsuSol: data.codUsuSol || "",
                solicitante: data.solicitante || "",
                status: data.status || "",
            });
        } catch (error) {
            console.error("Erro ao buscar dados", error);
        } finally {
            setLoading(false);
        }
    };

    // ─── Effects ──────────────────────────────────────────────────────────────

    useEffect(() => {
        const now = new Date();
        setDataAbertura(now.toLocaleDateString("pt-BR"));
        setHoraAbertura(now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second:'2-digit' }));
    }, []);

    useEffect(() => {
        if (mode === "view" && id) consultarBanco(id);
    }, [id, mode]);

    // ─── Helpers de estilo ────────────────────────────────────────────────────

    const inputClass = (campo?: keyof FormDataState) => {
        const base = "w-full p-2 rounded border transition-colors";
        if (campo && erros[campo]) return `${base} border-red-500 bg-red-50 focus:ring focus:ring-red-200`;
        return `${base} focus:ring focus:ring-blue-300`;
    };

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
                Solicitar Cadastro de Serviço
            </h2>

            {/* Informações da Solicitação */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h3 className="text-lg font-semibold mb-4 text-green-700">
                    Informações da Solicitação{" "}
                    {id && <span className="text-gray-500 text-sm font-normal">#{id}</span>}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-gray-700">Data de Abertura</label>
                        <input type="text" value={dataAbertura} readOnly className="w-full p-2 rounded border bg-gray-50" />
                    </div>
                    <div>
                        <label className="block text-gray-700">Hora</label>
                        <input type="text" value={horaAbertura} readOnly className="w-full p-2 rounded border bg-gray-50" />
                    </div>
                    <div>
                        <label className="block text-gray-700">Solicitante</label>
                        <input
                            type="text"
                            value={formData.codUsuSol ? `${formData.codUsuSol} - ${formData.solicitante}` : ""}
                            readOnly
                            className="w-full p-2 rounded border bg-gray-50"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700">Status</label>
                        <input
                            type="text"
                            value={
                                formData.status === "A" ? "Aberto"
                                : formData.status === "F" ? "Fechado"
                                : ""
                            }
                            readOnly
                            className="w-full p-2 rounded border bg-gray-50"
                        />
                    </div>
                </div>
            </div>

            {/* Dados do Serviço */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4 text-green-700">Dados do Serviço</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Cód. Grupo de Serviço — obrigatório */}
                    <div>
                        <label className="block font-bold text-red-700">
                            Cód. Grupo de Serviço <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            className={`${inputClass("codservico")} ${!isView ? "cursor-pointer hover:bg-gray-50" : ""}`}
                            name="codservico"
                            value={formData.codservico}
                            readOnly
                            onClick={() => !isView && abrirModal("grupo")}
                            placeholder="Clique para selecionar..."
                        />
                        {erros.codservico && (
                            <p className="text-red-500 text-sm mt-1">{erros.codservico}</p>
                        )}
                    </div>

                    {/* Descrição Serviço — obrigatório */}
                    <div>
                        <label className="block font-bold text-red-700">
                            Descrição Serviço <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Descrição Serviço..."
                            className={inputClass("descricao")}
                            value={formData.descricao}
                            readOnly={isView}
                            onChange={(e) => {
                                setFormData(prev => ({ ...prev, descricao: e.target.value }));
                                limparErro("descricao");
                            }}
                        />
                        {erros.descricao && (
                            <p className="text-red-500 text-sm mt-1">{erros.descricao}</p>
                        )}
                    </div>

                    {/* Unidade */}
                    <div className="md:col-span-2">
                        <label className="block text-gray-700">Unidade do Serviço</label>
                        <input
                            type="text"
                            className={`${inputClass()} ${!isView ? "cursor-pointer hover:bg-gray-50" : ""}`}
                            name="unidade"
                            value={formData.unidade}
                            readOnly
                            onClick={() => !isView && abrirModal("unidade")}
                            placeholder="Clique para selecionar..."
                        />
                    </div>

                    {/* Observação */}
                    <div className="md:col-span-2">
                        <label className="block text-gray-700">Observação</label>
                        <textarea
                            value={formData.observacaoservico}
                            readOnly={isView}
                            onChange={(e) =>
                                setFormData(prev => ({ ...prev, observacaoservico: e.target.value }))
                            }
                            className="w-full p-2 rounded border h-32 resize-y focus:ring focus:ring-blue-300"
                            placeholder="Digite observações sobre o serviço..."
                        />
                    </div>
                </div>

                {/* Botões */}
                <div className="flex justify-end space-x-4 mt-6">
                    <button
                        type="button"
                        onClick={() => navigate("/cadastros")}
                        className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                    >
                        Voltar
                    </button>

                    {!isView && (
                        <button
                            type="button"
                            onClick={handleSalvar}
                            disabled={saving}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {saving ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    Salvando...
                                </>
                            ) : (
                                "Salvar"
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Modal de Busca */}
            {showSearchModal && (
                <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-8 border border-gray-100">
                        <h3 className="text-2xl font-semibold mb-6 text-green-700">
                            {searchType === "grupo" ? "Pesquisar Grupo de Serviço" : "Pesquisar Unidade do Serviço"}
                        </h3>

                        <div className="flex gap-3 mb-6">
                            <input
                                type="text"
                                className="flex-1 p-4 text-lg border rounded-lg focus:ring-4 focus:ring-blue-100 outline-none"
                                placeholder={
                                    searchType === "grupo"
                                        ? "Digite o código do grupo..."
                                        : "Digite o nome da unidade..."
                                }
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && executarBusca()}
                            />
                            <button
                                onClick={() => executarBusca()}
                                className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-all"
                            >
                                {loading ? "..." : "Buscar"}
                            </button>
                        </div>

                        <div
                            className="max-h-96 overflow-y-auto"
                            onScroll={handleScroll}
                        >
                            <table className="w-full text-sm">
                                <tbody>
                                    {searchResults.map((item, index) => (
                                        <tr
                                            key={index}
                                            onClick={() => selecionarItem(item)}
                                            className="hover:bg-blue-50 cursor-pointer border-b last:border-0"
                                        >
                                            <td className="p-3 font-mono text-gray-500">{item.codGrupoProd}</td>
                                            <td className="p-3">{item.descrGrupoProd}</td>
                                        </tr>
                                    ))}

                                    {searchResults.length === 0 && !loading && (
                                        <tr>
                                            <td colSpan={2} className="text-center p-6 text-gray-400">
                                                Nenhum resultado. Digite e clique em Buscar.
                                            </td>
                                        </tr>
                                    )}

                                    {loading && (
                                        <tr>
                                            <td colSpan={2} className="text-center p-4 text-gray-400">
                                                Carregando...
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <button
                            onClick={fecharModal}
                            className="mt-8 w-full py-3 text-gray-500 font-semibold hover:text-gray-700"
                        >
                            Fechar Janela
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CadastroServicos;