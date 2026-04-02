import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { IconParceiro, IconProduto, IconServico } from "./icons/Icons";

interface CadastroParceiroProps {
    mode?: "create" | "view";
}

// ─── Tipos do Modal ───────────────────────────────────────────────────────────
type SearchType = "ufRg" | "codigoEnderecoQ" | "codigoBairroQ" | "codigoCidadeQ" | "banco" | null;

interface FormDataState {
    tipoParceiro: string;
    tipoPagamento: string;
    razaoSocial: string;
    nomeFantasia: string;
    inscricaoEstadual: string;
    cnpjCpf: string;
    email: string;
    telefone: string;
    banco: string;
    agencia: string;
    conta: string;
    endereco: string;
    cep: string;
    codigoCidadeQ: string;
    cidade: string;
    codigoBairroQ: string;
    codigoEnderecoQ: string;
    estado: string;
    estabelecimento: string;
    chavePix: string;
    dtEmissaoRg: string;
    emissorRg: string;
    rg: string;
    ufRg: string;
    observacaoParceiro: string;
    codUsuSol: string;
    solicitante: string;
    status: string;
}

// ─── Campos obrigatórios e suas labels ───────────────────────────────────────
const CAMPOS_OBRIGATORIOS: { campo: keyof FormDataState; label: string }[] = [
    { campo: "tipoParceiro",    label: "Tipo de Parceiro" },
    { campo: "tipoPagamento",   label: "Tipo de Pagamento" },
    { campo: "razaoSocial",     label: "Razão Social / Nome" },
    { campo: "nomeFantasia",    label: "Nome Fantasia" },
    { campo: "cnpjCpf",         label: "CNPJ / CPF" },
    { campo: "endereco",        label: "Endereço / Número" },
    { campo: "cep",             label: "CEP" },
    { campo: "codigoCidadeQ",   label: "Código Cidade Q" },
    { campo: "cidade",          label: "Cidade" },
    { campo: "codigoBairroQ",   label: "Código Bairro Q" },
    { campo: "estado",          label: "Estado" },
];

// ─── Labels do modal por tipo de busca ───────────────────────────────────────
const MODAL_LABELS: Record<NonNullable<SearchType>, { titulo: string; placeholder: string }> = {
    ufRg:            { titulo: "Pesquisar UF RG",             placeholder: "Digite a UF..." },
    codigoEnderecoQ: { titulo: "Pesquisar Código de Endereço", placeholder: "Digite o código ou descrição do endereço..." },
    codigoBairroQ:   { titulo: "Pesquisar Código de Bairro",   placeholder: "Digite o código ou nome do bairro..." },
    codigoCidadeQ:   { titulo: "Pesquisar Código de Cidade",   placeholder: "Digite o código ou nome da cidade..." },
    banco:           { titulo: "Pesquisar Banco",              placeholder: "Digite o nome ou código do banco..." },
};

type ErrosState = Partial<Record<keyof FormDataState, string>>;

function CadastroParceiro({ mode = "create" }: CadastroParceiroProps) {

    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isView = mode === "view";

    // ─── Estados do Modal ─────────────────────────────────────────────────────
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [searchQuery, setSearchQuery]         = useState("");
    const [searchResults, setSearchResults]     = useState<any[]>([]);
    const [page, setPage]                       = useState(1);
    const [hasMore, setHasMore]                 = useState(true);
    const [searchType, setSearchType]           = useState<SearchType>(null);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving]   = useState(false);
    const [erros, setErros]     = useState<ErrosState>({});

    const [dataAbertura, setDataAbertura] = useState("");
    const [horaAbertura, setHoraAbertura] = useState("");

    const [formData, setFormData] = useState<FormDataState>({
        tipoParceiro: "",
        tipoPagamento: "",
        razaoSocial: "",
        nomeFantasia: "",
        inscricaoEstadual: "",
        cnpjCpf: "",
        email: "",
        telefone: "",
        banco: "",
        agencia: "",
        conta: "",
        endereco: "",
        cep: "",
        codigoCidadeQ: "",
        cidade: "",
        codigoBairroQ: "",
        codigoEnderecoQ: "",
        estado: "",
        estabelecimento: "",
        chavePix: "",
        dtEmissaoRg: "",
        emissorRg: "",
        rg: "",
        ufRg: "",
        observacaoParceiro: "",
        codUsuSol: "",
        solicitante: "",
        status: "",
    });

    // ─── Validação ────────────────────────────────────────────────────────────

    const validar = (): boolean => {
        const novosErros: ErrosState = {};

        CAMPOS_OBRIGATORIOS.forEach(({ campo, label }) => {
            const valor = formData[campo];
            if (typeof valor === "string" && !valor.trim()) {
                novosErros[campo] = `${label} é obrigatório.`;
            }
        });

        setErros(novosErros);
        return Object.keys(novosErros).length === 0;
    };

    const limparErro = (campo: keyof FormDataState) => {
        if (erros[campo]) {
            setErros(prev => {
                const novo = { ...prev };
                delete novo[campo];
                return novo;
            });
        }
    };

    // ─── Helpers de estilo ────────────────────────────────────────────────────

    // clickable = true aplica cursor-pointer + hover para inputs que abrem modal
    const inputClass = (campo?: keyof FormDataState, clickable = false) => {
        const base = "w-full p-2 rounded border transition-colors";
        const click = clickable && !isView ? "cursor-pointer hover:bg-gray-50" : "";
        if (campo && erros[campo])
            return `${base} border-red-500 bg-red-50 focus:ring focus:ring-red-200 ${click}`.trim();
        return `${base} focus:ring focus:ring-blue-300 ${click}`.trim();
    };

    const selectClass = (campo?: keyof FormDataState) => {
        const base = "w-full p-2 rounded border transition-colors";
        if (campo && erros[campo])
            return `${base} border-red-500 bg-red-50 focus:ring focus:ring-red-200`;
        return `${base} focus:ring focus:ring-blue-300`;
    };

    // ─── Submit ───────────────────────────────────────────────────────────────

    const handleSalvar = async () => {
        if (!validar()) return;

        setSaving(true);
        try {
            const payload = {
                tipoParceiro: formData.tipoParceiro,
                tipoPagamento: formData.tipoPagamento,
                razaoSocial: formData.razaoSocial,
                nomeFantasia: formData.nomeFantasia,
                inscricaoEstadual: formData.inscricaoEstadual,
                cnpjCpf: formData.cnpjCpf,
                email: formData.email,
                telefone: formData.telefone,
                banco: formData.banco,
                agencia: formData.agencia,
                conta: formData.conta,
                endereco: formData.endereco,
                cep: formData.cep,
                codigoCidadeQ: formData.codigoCidadeQ,
                cidade: formData.cidade,
                codigoBairroQ: formData.codigoBairroQ,
                codigoEnderecoQ: formData.codigoEnderecoQ,
                estado: formData.estado,
                estabelecimento: formData.estabelecimento,
                chavePix: formData.chavePix,
                dtEmissaoRg: formData.dtEmissaoRg,
                emissorRg: formData.emissorRg,
                rg: formData.rg,
                ufRg: formData.ufRg,
                observacaoParceiro: formData.observacaoParceiro,
                dataIni: dataAbertura && horaAbertura,
            };

            const response = await fetch("http://127.0.0.1:3333/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error("Erro ao salvar");

            // navigate("/cadastros");
        } catch (error) {
            console.error("Erro ao salvar:", error);
            alert("Erro ao salvar o parceiro. Tente novamente.");
        } finally {
            setSaving(false);
        }
    };

    // ─── Modal de busca ───────────────────────────────────────────────────────

    const abrirModal = (tipo: SearchType) => {
        setSearchType(tipo);
        setSearchResults([]);   // limpa resultados anteriores
        setSearchQuery("");     // limpa o texto digitado
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
                `http://127.0.0.1:3333/partners?search=${searchQuery}&type=${searchType}&page=${pagina}`
            );
            const result = await response.json();
            const novosDados = result.data || [];

            setSearchResults(prev => pagina === 1 ? novosDados : [...prev, ...novosDados]);
            setPage(pagina);
            if (result.meta.current_page >= result.meta.last_page) setHasMore(false);
        } catch (error) {
            console.error("Erro na busca:", error);
        } finally {
            setLoading(false);
        }
    };

    // Cada case popula os campos certos conforme o tipo selecionado
    const selecionarItem = (item: any) => {
        const valorFormatado = `${item.codGrupoProd} - ${item.descrGrupoProd}`;

        switch (searchType) {
            case "ufRg":
                setFormData(prev => ({ ...prev, ufRg: valorFormatado }));
                break;

            case "codigoEnderecoQ":
                setFormData(prev => ({ ...prev, codigoEnderecoQ: valorFormatado }));
                break;

            case "codigoBairroQ":
                setFormData(prev => ({ ...prev, codigoBairroQ: valorFormatado }));
                limparErro("codigoBairroQ");
                break;

            case "codigoCidadeQ":
                setFormData(prev => ({ ...prev, codigoCidadeQ: valorFormatado }));
                limparErro("codigoCidadeQ");
                break;

            case "banco":
                setFormData(prev => ({ ...prev, banco: valorFormatado }));
                break;
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
                tipoParceiro: data.tipoParceiro || "",
                tipoPagamento: data.tipoPagamento || "",
                razaoSocial: data.razaoSocial || "",
                nomeFantasia: data.nomeFantasia || "",
                inscricaoEstadual: data.inscricaoEstadual || "",
                cnpjCpf: data.cnpjCpf || "",
                email: data.email || "",
                telefone: data.telefone || "",
                banco: data.banco || "",
                agencia: data.agencia || "",
                conta: data.conta || "",
                endereco: data.endereco || "",
                cep: data.cep || "",
                codigoCidadeQ: data.codigoCidadeQ || "",
                cidade: data.cidade || "",
                codigoBairroQ: data.codigoBairroQ || "",
                codigoEnderecoQ: data.codigoEnderecoQ || "",
                estado: data.estado || "",
                estabelecimento: data.estabelecimento || "",
                chavePix: data.chavePix || "",
                dtEmissaoRg: data.dtEmissaoRg || "",
                emissorRg: data.emissorRg || "",
                rg: data.rg || "",
                ufRg: data.ufRg || "",
                observacaoParceiro: data.observacaoParceiro || "",
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
        setHoraAbertura(now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
    }, []);

    useEffect(() => {
        if (mode === "view" && id) consultarBanco(id);
    }, [id, mode]);

    // ─── Render ───────────────────────────────────────────────────────────────

    if (loading && mode === "view") {
        return <div className="p-8">Carregando dados...</div>;
    }

    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
                Solicitar Cadastro de Parceiro
            </h2>

            {/* Informações da Solicitação */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h3 className="text-lg font-semibold mb-4 text-green-700">
                    Informações da Solicitação
                    {id && <span className="text-gray-500 text-sm font-normal"> #{id}</span>}
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

            {/* Dados do Parceiro */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4 text-green-700">Dados do Parceiro</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <fieldset disabled={isView} className="contents">

                        {/* Parceiro Cadastrado */}
                        <div className="md:col-span-2">
                            <label className="block text-gray-700">Parceiro Cadastrado</label>
                            <input
                                type="text"
                                className={inputClass()}
                                value={formData.nomeFantasia}
                                onChange={(e) => setFormData(prev => ({ ...prev, nomeFantasia: e.target.value }))}
                            />
                        </div>

                        {/* Tipo de Parceiro — obrigatório, select */}
                        <div>
                            <label className="block font-bold text-red-700">
                                Tipo de Parceiro <span className="text-red-500">*</span>
                            </label>
                            <select
                                className={selectClass("tipoParceiro")}
                                value={formData.tipoParceiro}
                                onChange={(e) => {
                                    setFormData(prev => ({ ...prev, tipoParceiro: e.target.value }));
                                    limparErro("tipoParceiro");
                                }}
                            >
                                <option value="">Selecione...</option>
                                <option>Cliente</option>
                                <option>Fornecedor</option>
                                <option>Funcionário</option>
                                <option>Transportador</option>
                                <option>Transportadora Frete 3°</option>
                            </select>
                            {erros.tipoParceiro && (
                                <p className="text-red-500 text-sm mt-1">{erros.tipoParceiro}</p>
                            )}
                        </div>

                        {/* Tipo de Pagamento — obrigatório, select */}
                        <div>
                            <label className="block font-bold text-red-700">
                                Tipo de Pagamento <span className="text-red-500">*</span>
                            </label>
                            <select
                                className={selectClass("tipoPagamento")}
                                value={formData.tipoPagamento}
                                onChange={(e) => {
                                    setFormData(prev => ({ ...prev, tipoPagamento: e.target.value }));
                                    limparErro("tipoPagamento");
                                }}
                            >
                                <option value="">Selecione...</option>
                                <option>Boleto</option>
                                <option>Deposito</option>
                                <option>Cheque</option>
                                <option>Cartão de Crédito</option>
                            </select>
                            {erros.tipoPagamento && (
                                <p className="text-red-500 text-sm mt-1">{erros.tipoPagamento}</p>
                            )}
                        </div>

                        {/* Razão Social — obrigatório */}
                        <div>
                            <label className="block font-bold text-red-700">
                                Razão Social / Nome <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                className={inputClass("razaoSocial")}
                                value={formData.razaoSocial}
                                onChange={(e) => {
                                    setFormData(prev => ({ ...prev, razaoSocial: e.target.value }));
                                    limparErro("razaoSocial");
                                }}
                            />
                            {erros.razaoSocial && (
                                <p className="text-red-500 text-sm mt-1">{erros.razaoSocial}</p>
                            )}
                        </div>

                        {/* Nome Fantasia — obrigatório */}
                        <div>
                            <label className="block font-bold text-red-700">
                                Nome Fantasia <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                className={inputClass("nomeFantasia")}
                                value={formData.nomeFantasia}
                                onChange={(e) => {
                                    setFormData(prev => ({ ...prev, nomeFantasia: e.target.value }));
                                    limparErro("nomeFantasia");
                                }}
                            />
                            {erros.nomeFantasia && (
                                <p className="text-red-500 text-sm mt-1">{erros.nomeFantasia}</p>
                            )}
                        </div>

                        {/* Inscrição Estadual */}
                        <div>
                            <label className="block text-gray-700">Inscrição Estadual</label>
                            <input
                                type="text"
                                className={inputClass()}
                                value={formData.inscricaoEstadual}
                                onChange={(e) => setFormData(prev => ({ ...prev, inscricaoEstadual: e.target.value }))}
                            />
                        </div>

                        {/* CNPJ / CPF — obrigatório */}
                        <div>
                            <label className="block font-bold text-red-700">
                                CNPJ / CPF <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                className={inputClass("cnpjCpf")}
                                value={formData.cnpjCpf}
                                onChange={(e) => {
                                    setFormData(prev => ({ ...prev, cnpjCpf: e.target.value }));
                                    limparErro("cnpjCpf");
                                }}
                            />
                            {erros.cnpjCpf && (
                                <p className="text-red-500 text-sm mt-1">{erros.cnpjCpf}</p>
                            )}
                        </div>

                        {/* E-mail */}
                        <div>
                            <label className="block text-gray-700">E-mail</label>
                            <input
                                type="email"
                                className={inputClass()}
                                value={formData.email}
                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            />
                        </div>

                        {/* Telefone */}
                        <div>
                            <label className="block text-gray-700">Telefone</label>
                            <input
                                type="tel"
                                className={inputClass()}
                                value={formData.telefone}
                                onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                            />
                        </div>

                        {/* Banco — abre modal */}
                        <div>
                            <label className="block text-gray-700">Banco</label>
                            <input
                                type="text"
                                className={inputClass(undefined, true)}
                                value={formData.banco}
                                readOnly
                                onClick={() => !isView && abrirModal("banco")}
                                placeholder="Clique para selecionar..."
                            />
                        </div>

                        {/* Agência */}
                        <div>
                            <label className="block text-gray-700">Agência</label>
                            <input
                                type="text"
                                className={inputClass()}
                                value={formData.agencia}
                                onChange={(e) => setFormData(prev => ({ ...prev, agencia: e.target.value }))}
                            />
                        </div>

                        {/* Conta */}
                        <div>
                            <label className="block text-gray-700">Conta</label>
                            <input
                                type="text"
                                className={inputClass()}
                                value={formData.conta}
                                onChange={(e) => setFormData(prev => ({ ...prev, conta: e.target.value }))}
                            />
                        </div>

                        {/* Endereço / Número — obrigatório */}
                        <div>
                            <label className="block font-bold text-red-700">
                                Endereço / Número <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                className={inputClass("endereco")}
                                value={formData.endereco}
                                onChange={(e) => {
                                    setFormData(prev => ({ ...prev, endereco: e.target.value }));
                                    limparErro("endereco");
                                }}
                            />
                            {erros.endereco && (
                                <p className="text-red-500 text-sm mt-1">{erros.endereco}</p>
                            )}
                        </div>

                        {/* CEP — obrigatório */}
                        <div>
                            <label className="block font-bold text-red-700">
                                CEP <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                className={inputClass("cep")}
                                value={formData.cep}
                                onChange={(e) => {
                                    setFormData(prev => ({ ...prev, cep: e.target.value }));
                                    limparErro("cep");
                                }}
                            />
                            {erros.cep && (
                                <p className="text-red-500 text-sm mt-1">{erros.cep}</p>
                            )}
                        </div>

                        {/* Código Cidade Q — obrigatório + modal */}
                        <div>
                            <label className="block font-bold text-red-700">
                                Código Cidade Q <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                className={inputClass("codigoCidadeQ", true)}
                                value={formData.codigoCidadeQ}
                                readOnly
                                onClick={() => !isView && abrirModal("codigoCidadeQ")}
                                placeholder="Clique para selecionar..."
                            />
                            {erros.codigoCidadeQ && (
                                <p className="text-red-500 text-sm mt-1">{erros.codigoCidadeQ}</p>
                            )}
                        </div>

                        {/* Cidade — obrigatório */}
                        <div>
                            <label className="block font-bold text-red-700">
                                Cidade <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                className={inputClass("cidade")}
                                value={formData.cidade}
                                onChange={(e) => {
                                    setFormData(prev => ({ ...prev, cidade: e.target.value }));
                                    limparErro("cidade");
                                }}
                            />
                            {erros.cidade && (
                                <p className="text-red-500 text-sm mt-1">{erros.cidade}</p>
                            )}
                        </div>

                        {/* Código Bairro Q — obrigatório + modal */}
                        <div>
                            <label className="block font-bold text-red-700">
                                Código Bairro Q <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                className={inputClass("codigoBairroQ", true)}
                                value={formData.codigoBairroQ}
                                readOnly
                                onClick={() => !isView && abrirModal("codigoBairroQ")}
                                placeholder="Clique para selecionar..."
                            />
                            {erros.codigoBairroQ && (
                                <p className="text-red-500 text-sm mt-1">{erros.codigoBairroQ}</p>
                            )}
                        </div>

                        {/* Código Endereço Q — abre modal */}
                        <div>
                            <label className="block text-gray-700">Código Endereço Q</label>
                            <input
                                type="text"
                                className={inputClass(undefined, true)}
                                value={formData.codigoEnderecoQ}
                                readOnly
                                onClick={() => !isView && abrirModal("codigoEnderecoQ")}
                                placeholder="Clique para selecionar..."
                            />
                        </div>

                        {/* Estado — obrigatório */}
                        <div>
                            <label className="block font-bold text-red-700">
                                Estado <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                className={inputClass("estado")}
                                value={formData.estado}
                                onChange={(e) => {
                                    setFormData(prev => ({ ...prev, estado: e.target.value }));
                                    limparErro("estado");
                                }}
                            />
                            {erros.estado && (
                                <p className="text-red-500 text-sm mt-1">{erros.estado}</p>
                            )}
                        </div>

                        {/* Estabelecimento */}
                        <div>
                            <label className="block text-gray-700">Estabelecimento p/ fins de transporte</label>
                            <input
                                type="text"
                                className={inputClass()}
                                value={formData.estabelecimento}
                                onChange={(e) => setFormData(prev => ({ ...prev, estabelecimento: e.target.value }))}
                            />
                        </div>

                        {/* Chave Pix */}
                        <div>
                            <label className="block text-gray-700">Chave Pix</label>
                            <input
                                type="text"
                                className={inputClass()}
                                value={formData.chavePix}
                                onChange={(e) => setFormData(prev => ({ ...prev, chavePix: e.target.value }))}
                            />
                        </div>

                        {/* DT. Emissão RG */}
                        <div>
                            <label className="block text-gray-700">DT. Emissão RG</label>
                            <input
                                type="date"
                                className={inputClass()}
                                value={formData.dtEmissaoRg}
                                onChange={(e) => setFormData(prev => ({ ...prev, dtEmissaoRg: e.target.value }))}
                            />
                        </div>

                        {/* Emissor RG — select */}
                        <div>
                            <label className="block text-gray-700">Emissor RG</label>
                            <select
                                className={selectClass()}
                                value={formData.emissorRg}
                                onChange={(e) => setFormData(prev => ({ ...prev, emissorRg: e.target.value }))}
                            >
                                <option value="">Selecione...</option>
                                <option>SSP - Secretaria de Segurança Pública</option>
                                <option>SES - Carteira de Estrangeiro</option>
                                <option>POM - Polícia Militar</option>
                                <option>POF - Polícia Federal</option>
                                <option>PC - Polícia Civil</option>
                                <option>MMA - Ministério da Marinha</option>
                                <option>MEX - Ministério do Exército</option>
                                <option>MAE - Ministério da Aeronáutica</option>
                                <option>IPF - Instituto Pereira Faustino</option>
                                <option>IFP - Instituto Félix Pacheco</option>
                                <option>DIC - Diretoria de Identificação Civil</option>
                                <option>CNH - Carteira Nacional de Habilitação</option>
                            </select>
                        </div>

                        {/* RG */}
                        <div>
                            <label className="block text-gray-700">RG</label>
                            <input
                                type="text"
                                className={inputClass()}
                                value={formData.rg}
                                onChange={(e) => setFormData(prev => ({ ...prev, rg: e.target.value }))}
                            />
                        </div>

                        {/* UF RG — abre modal */}
                        <div>
                            <label className="block text-gray-700">UF RG</label>
                            <input
                                type="text"
                                className={inputClass(undefined, true)}
                                value={formData.ufRg}
                                readOnly
                                onClick={() => !isView && abrirModal("ufRg")}
                                placeholder="Clique para selecionar..."
                            />
                        </div>

                        {/* Observação */}
                        <div className="md:col-span-2">
                            <label className="block text-gray-700">Observação Parceiro</label>
                            <textarea
                                className="w-full p-2 rounded border h-32 resize-y focus:ring focus:ring-blue-300"
                                placeholder="Digite observações sobre o parceiro..."
                                value={formData.observacaoParceiro}
                                onChange={(e) => setFormData(prev => ({ ...prev, observacaoParceiro: e.target.value }))}
                            />
                        </div>

                    </fieldset>
                </div>

                {/* Botões de ação */}
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
            {showSearchModal && searchType && (
                <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-8 border border-gray-100">

                        {/* Título e placeholder mudam conforme o tipo */}
                        <h3 className="text-2xl font-semibold mb-6 text-green-700">
                            {MODAL_LABELS[searchType].titulo}
                        </h3>

                        <div className="flex gap-3 mb-6">
                            <input
                                type="text"
                                className="flex-1 p-4 text-lg border rounded-lg focus:ring-4 focus:ring-blue-100 outline-none"
                                placeholder={MODAL_LABELS[searchType].placeholder}
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

                        <div className="max-h-96 overflow-y-auto" onScroll={handleScroll}>
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

export default CadastroParceiro;