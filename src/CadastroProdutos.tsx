import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { IconParceiro, IconProduto, IconServico } from "./icons/Icons";


interface CadastroProdutosProps {
    mode?: "create" | "view";
}

// ─── Tipos do Modal ───────────────────────────────────────────────────────────
type SearchType = "produto" | "marca" | "codGrupoProduto" | "unidade" | "ncm" | "nTransgenia" | null;

interface FormDataState {
    nomeComercial: string;
    produto: string;
    descricaoproduto: string;
    unidade: string;
    marca: string;
    referencia2: string;
    referencia3: string;
    referencia4: string;
    codGrupoProduto: string;
    ncm: string;
    decimaisQuantidade: string;
    decimaisValor: string;
    complemento: string;
    fabricante: string;
    homePage: string;
    codFabricante: string;
    caracteristicas: string;
    observacao: string;
    ingredienteAtivo: string;
    classificacaoToxicologica: string;
    formulacaoFisica: string;
    nTransgenia: string;
    cicloDias: string;
    cultura: string;
    produtividade: string;
    utilizaCultura: boolean;
    codUsuSol: string;
    solicitante: string;
    status: string;
}

// ─── Campos obrigatórios e suas labels ───────────────────────────────────────
const CAMPOS_OBRIGATORIOS: { campo: keyof FormDataState; label: string }[] = [
    { campo: "nomeComercial", label: "Nome Comercial" },
    { campo: "codGrupoProduto", label: "Cód. do Grupo Produto" },
    { campo: "unidade", label: "Unidade" },
    { campo: "decimaisQuantidade", label: "Decimais para Quantidade" },
    { campo: "decimaisValor", label: "Decimais para Valor" },
];

// ─── Labels do modal por busca ─────────────────────────────────────────────────
const MODAL_LABELS: Record<NonNullable<SearchType>, { titulo: string; placeholder: string }> = {
    produto: { titulo: "Pesquisar Produto", placeholder: "Digite o nome ou código do produto..." },
    marca: { titulo: "Pesquisar Marca", placeholder: "Digite o nome da marca..." },
    codGrupoProduto: { titulo: "Pesquisar Grupo de Produto", placeholder: "Digite o código ou descrição do grupo..." },
    unidade: { titulo: "Pesquisar Unidade", placeholder: "Digite o nome da unidade..." },
    ncm: { titulo: "Pesquisar NCM", placeholder: "Digite o código NCM..." },
    nTransgenia: { titulo: "Pesquisar Nº Transgênia", placeholder: "Digite o número de transgênia..." },
};

type ErrosState = Partial<Record<keyof FormDataState, string>>;

function CadastroProdutos({ mode = "create" }: CadastroProdutosProps) {

    const [dataAbertura, setDataAbertura] = useState("");
    const [horaAbertura, setHoraAbertura] = useState("");

    // ─── Estados do Modal ─────────────────────────────────────────────────────
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [searchType, setSearchType] = useState<SearchType>(null);

    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isView = mode === "view";

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [erros, setErros] = useState<ErrosState>({});

    const [formData, setFormData] = useState<FormDataState>({
        nomeComercial: "",
        produto: "",
        descricaoproduto: "",
        unidade: "",
        marca: "",
        referencia2: "",
        referencia3: "",
        referencia4: "",
        codGrupoProduto: "",
        ncm: "",
        decimaisQuantidade: "",
        decimaisValor: "",
        complemento: "",
        fabricante: "",
        homePage: "",
        codFabricante: "",
        caracteristicas: "",
        observacao: "",
        ingredienteAtivo: "",
        classificacaoToxicologica: "",
        formulacaoFisica: "",
        nTransgenia: "",
        cicloDias: "",
        cultura: "",
        produtividade: "",
        utilizaCultura: false,
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

    // ─── Submit ───────────────────────────────────────────────────────────────

    const handleSalvar = async () => {
        if (!validar()) return;

        setSaving(true);
        try {
            const payload = {
                nomeComercial: formData.nomeComercial,
                produto: formData.produto,
                descricaoproduto: formData.descricaoproduto,
                unidade: formData.unidade,
                marca: formData.marca,
                referencia2: formData.referencia2,
                referencia3: formData.referencia3,
                referencia4: formData.referencia4,
                codGrupoProduto: formData.codGrupoProduto,
                ncm: formData.ncm,
                decimaisQuantidade: formData.decimaisQuantidade,
                decimaisValor: formData.decimaisValor,
                complemento: formData.complemento,
                fabricante: formData.fabricante,
                homePage: formData.homePage,
                codFabricante: formData.codFabricante,
                caracteristicas: formData.caracteristicas,
                observacao: formData.observacao,
                ingredienteAtivo: formData.ingredienteAtivo,
                classificacaoToxicologica: formData.classificacaoToxicologica,
                formulacaoFisica: formData.formulacaoFisica,
                nTransgenia: formData.nTransgenia,
                cicloDias: formData.cicloDias,
                cultura: formData.cultura,
                produtividade: formData.produtividade,
                utilizaCultura: formData.utilizaCultura,
                dataIni: dataAbertura && horaAbertura,
            };
            console.log('Payload a ser enviado: ', payload);

            const response = await fetch("http://127.0.0.1:3333/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error("Erro ao salvar");

            // navigate("/cadastros");
        } catch (error) {
            console.error("Erro ao salvar:", error);
            alert("Erro ao salvar o produto. Tente novamente.");
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

        console.info('Palavras: ', searchQuery, '| modal: ', searchType, '| pagina: ', pagina);
        try {

            const response = await fetch(
                `http://127.0.0.1:3333/products?search=${searchQuery}&type=${searchType}&page=${pagina}`
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

    // Cada case popula os campos certos do formData conforme o tipo selecionado
    const selecionarItem = (item: any) => {
        const valorFormatado = `${item.codGrupoProd} - ${item.descrGrupoProd}`;

        switch (searchType) {
            case "produto":
                setFormData(prev => ({
                    ...prev,
                    produto: String(item.codGrupoProd),
                    descricaoproduto: item.descrGrupoProd,
                }));
                break;

            case "marca":
                setFormData(prev => ({ ...prev, marca: valorFormatado }));
                break;

            case "codGrupoProduto":
                setFormData(prev => ({ ...prev, codGrupoProduto: valorFormatado }));
                limparErro("codGrupoProduto");
                break;

            case "unidade":
                setFormData(prev => ({ ...prev, unidade: valorFormatado }));
                limparErro("unidade");
                break;

            case "ncm":
                setFormData(prev => ({ ...prev, ncm: valorFormatado }));
                break;

            case "nTransgenia":
                setFormData(prev => ({ ...prev, nTransgenia: valorFormatado }));
                break;
        }

        fecharModal();
    };

    // ─── Consulta view ────────────────────────────────────────────────────────

    const consultarBanco = async (nroSolicitacao: string) => {
        setLoading(true);
        try {
            const response = await fetch(`http://127.0.0.1:3333/grupo/${nroSolicitacao}`);
            if (!response.ok) throw new Error("Erro ao buscar dados");

            const data = await response.json();

            setFormData({
                nomeComercial: data.nomeComercial || "",
                produto: data.codproduto || "",
                descricaoproduto: data.nomeComercial || "",
                unidade: data.unidade || "",
                marca: data.marca || "",
                referencia2: data.referencia2 || "",
                referencia3: data.referencia3 || "",
                referencia4: data.referencia4 || "",
                codGrupoProduto: data.codGrupoProduto || "",
                ncm: data.ncm || "",
                decimaisQuantidade: data.decimaisQuantidade || "",
                decimaisValor: data.decimaisValor || "",
                complemento: data.complemento || "",
                fabricante: data.fabricante || "",
                homePage: data.homePage || "",
                codFabricante: data.codFabricante || "",
                caracteristicas: data.caracteristicas || "",
                observacao: data.observacao || "",
                ingredienteAtivo: data.ingredienteAtivo || "",
                classificacaoToxicologica: data.classificacaoToxicologica || "",
                formulacaoFisica: data.formulacaoFisica || "",
                nTransgenia: data.nTransgenia || "",
                cicloDias: data.cicloDias || "",
                cultura: data.cultura || "",
                produtividade: data.produtividade || "",
                utilizaCultura: data.utilizaCultura || false,
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

    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
                Solicitar Cadastro de Produto
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

            {/* Dados do Produto */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4 text-green-700">Dados do Produto</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <fieldset disabled={isView} className="contents">

                        {/* Nome Comercial — obrigatório, digitável */}
                        <div>
                            <label className="block font-bold text-red-700">
                                Nome Comercial <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                className={inputClass("nomeComercial")}
                                value={formData.nomeComercial}
                                onChange={(e) => {
                                    setFormData(prev => ({ ...prev, nomeComercial: e.target.value }));
                                    limparErro("nomeComercial");
                                }}
                            />
                            {erros.nomeComercial && (
                                <p className="text-red-500 text-sm mt-1">{erros.nomeComercial}</p>
                            )}
                        </div>

                        {/* Produto — abre modal */}
                        <div>
                            <label className="block text-gray-700">Produto</label>
                            <input
                                type="text"
                                className={inputClass(undefined, true)}
                                value={formData.produto ? `${formData.produto} - ${formData.descricaoproduto}` : ""}
                                readOnly
                                onClick={() => !isView && abrirModal("produto")}
                                placeholder="Clique para selecionar..."
                            />
                        </div>

                        {/* Marca — abre modal */}
                        <div>
                            <label className="block text-gray-700">Marca</label>
                            <input
                                type="text"
                                className={inputClass(undefined, true)}
                                value={formData.marca}
                                readOnly
                                onClick={() => !isView && abrirModal("marca")}
                                placeholder="Clique para selecionar..."
                            />
                        </div>

                        {/* Referência 2 */}
                        <div>
                            <label className="block text-gray-700">Referência 2</label>
                            <input
                                type="text"
                                className={inputClass()}
                                value={formData.referencia2}
                                onChange={(e) => setFormData(prev => ({ ...prev, referencia2: e.target.value }))}
                            />
                        </div>

                        {/* Referência 3 */}
                        <div>
                            <label className="block text-gray-700">Referência 3</label>
                            <input
                                type="text"
                                className={inputClass()}
                                value={formData.referencia3}
                                onChange={(e) => setFormData(prev => ({ ...prev, referencia3: e.target.value }))}
                            />
                        </div>

                        {/* Referência 4 */}
                        <div>
                            <label className="block text-gray-700">Referência 4</label>
                            <input
                                type="text"
                                className={inputClass()}
                                value={formData.referencia4}
                                onChange={(e) => setFormData(prev => ({ ...prev, referencia4: e.target.value }))}
                            />
                        </div>

                        {/* Cód. do Grupo Produto — obrigatório + modal */}
                        <div>
                            <label className="block font-bold text-red-700">
                                Cód. do Grupo Produto <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                className={inputClass("codGrupoProduto", true)}
                                value={formData.codGrupoProduto}
                                readOnly
                                onClick={() => !isView && abrirModal("codGrupoProduto")}
                                placeholder="Clique para selecionar..."
                            />
                            {erros.codGrupoProduto && (
                                <p className="text-red-500 text-sm mt-1">{erros.codGrupoProduto}</p>
                            )}
                        </div>

                        {/* Unidade — obrigatório + modal */}
                        <div>
                            <label className="block font-bold text-red-700">
                                Unidade <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                className={inputClass("unidade", true)}
                                value={formData.unidade}
                                readOnly
                                onClick={() => !isView && abrirModal("unidade")}
                                placeholder="Clique para selecionar..."
                            />
                            {erros.unidade && (
                                <p className="text-red-500 text-sm mt-1">{erros.unidade}</p>
                            )}
                        </div>

                        {/* NCM — abre modal */}
                        <div>
                            <label className="block text-gray-700">NCM</label>
                            <input
                                type="text"
                                className={inputClass(undefined, true)}
                                value={formData.ncm}
                                readOnly
                                onClick={() => !isView && abrirModal("ncm")}
                                placeholder="Clique para selecionar..."
                            />
                        </div>

                        {/* Decimais para Quantidade — obrigatório, digitável */}
                        <div>
                            <label className="block font-bold text-red-700">
                                Decimais para Quantidade <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                className={inputClass("decimaisQuantidade")}
                                value={formData.decimaisQuantidade}
                                onChange={(e) => {
                                    setFormData(prev => ({ ...prev, decimaisQuantidade: e.target.value }));
                                    limparErro("decimaisQuantidade");
                                }}
                            />
                            {erros.decimaisQuantidade && (
                                <p className="text-red-500 text-sm mt-1">{erros.decimaisQuantidade}</p>
                            )}
                        </div>

                        {/* Decimais para Valor — obrigatório, digitável */}
                        <div>
                            <label className="block font-bold text-red-700">
                                Decimais para Valor <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                className={inputClass("decimaisValor")}
                                value={formData.decimaisValor}
                                onChange={(e) => {
                                    setFormData(prev => ({ ...prev, decimaisValor: e.target.value }));
                                    limparErro("decimaisValor");
                                }}
                            />
                            {erros.decimaisValor && (
                                <p className="text-red-500 text-sm mt-1">{erros.decimaisValor}</p>
                            )}
                        </div>

                        {/* Complemento */}
                        <div>
                            <label className="block text-gray-700">Complemento</label>
                            <input
                                type="text"
                                className={inputClass()}
                                value={formData.complemento}
                                onChange={(e) => setFormData(prev => ({ ...prev, complemento: e.target.value }))}
                            />
                        </div>

                        {/* Fabricante */}
                        <div>
                            <label className="block text-gray-700">Fabricante</label>
                            <input
                                type="text"
                                className={inputClass()}
                                value={formData.fabricante}
                                onChange={(e) => setFormData(prev => ({ ...prev, fabricante: e.target.value }))}
                            />
                        </div>

                        {/* Home Page */}
                        <div>
                            <label className="block text-gray-700">Home Page</label>
                            <input
                                type="text"
                                className={inputClass()}
                                value={formData.homePage}
                                onChange={(e) => setFormData(prev => ({ ...prev, homePage: e.target.value }))}
                            />
                        </div>

                        {/* Cód. Fabricante */}
                        <div>
                            <label className="block text-gray-700">Cód. Fabricante</label>
                            <input
                                type="text"
                                className={inputClass()}
                                value={formData.codFabricante}
                                onChange={(e) => setFormData(prev => ({ ...prev, codFabricante: e.target.value }))}
                            />
                        </div>

                        {/* Características */}
                        <div className="md:col-span-2">
                            <label className="block text-gray-700">Características do Produto</label>
                            <textarea
                                className="w-full p-2 rounded border h-32 resize-y focus:ring focus:ring-blue-300"
                                placeholder="Digite as características do produto..."
                                value={formData.caracteristicas}
                                onChange={(e) => setFormData(prev => ({ ...prev, caracteristicas: e.target.value }))}
                            />
                        </div>

                        {/* Observação */}
                        <div className="md:col-span-2">
                            <label className="block text-gray-700">Observação</label>
                            <textarea
                                className="w-full p-2 rounded border h-32 resize-y focus:ring focus:ring-blue-300"
                                placeholder="Digite observações sobre o produto..."
                                value={formData.observacao}
                                onChange={(e) => setFormData(prev => ({ ...prev, observacao: e.target.value }))}
                            />
                        </div>

                        {/* Seção Agrícola */}
                        <div className="md:col-span-2">
                            <h3 className="text-lg font-semibold mb-4 text-green-700">Agrícola</h3>
                            <div className="my-6 border-t-4 border-blue-400" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-gray-700">Ingrediente Ativo</label>
                                    <input
                                        type="text"
                                        className={inputClass()}
                                        placeholder="Digite o ingrediente ativo"
                                        value={formData.ingredienteAtivo}
                                        onChange={(e) => setFormData(prev => ({ ...prev, ingredienteAtivo: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700">Classificação Toxicológica</label>
                                    <input
                                        type="text"
                                        className={inputClass()}
                                        value={formData.classificacaoToxicologica}
                                        onChange={(e) => setFormData(prev => ({ ...prev, classificacaoToxicologica: e.target.value }))}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Formulação Física */}
                        <div>
                            <label className="block text-gray-700">Formulação Física</label>
                            <input
                                type="text"
                                className={inputClass()}
                                placeholder="Ex: pó, líquido, granulado..."
                                value={formData.formulacaoFisica}
                                onChange={(e) => setFormData(prev => ({ ...prev, formulacaoFisica: e.target.value }))}
                            />
                        </div>

                        {/* Nº Transgênia — abre modal */}
                        <div>
                            <label className="block text-gray-700">Nº Transgênia</label>
                            <input
                                type="text"
                                className={inputClass(undefined, true)}
                                value={formData.nTransgenia}
                                readOnly
                                onClick={() => !isView && abrirModal("nTransgenia")}
                                placeholder="Clique para selecionar..."
                            />
                        </div>

                        {/* Ciclo em dias */}
                        <div>
                            <label className="block text-gray-700">Ciclo em dias</label>
                            <input
                                type="number"
                                className={inputClass()}
                                placeholder="Ex: 90"
                                value={formData.cicloDias}
                                onChange={(e) => setFormData(prev => ({ ...prev, cicloDias: e.target.value }))}
                            />
                        </div>

                        {/* Cultura */}
                        <div>
                            <label className="block text-gray-700">Cultura</label>
                            <input
                                type="text"
                                className={inputClass()}
                                placeholder="Ex: soja, milho, algodão..."
                                value={formData.cultura}
                                onChange={(e) => setFormData(prev => ({ ...prev, cultura: e.target.value }))}
                            />
                        </div>

                        {/* Produtividade */}
                        <div>
                            <label className="block text-gray-700">Produtividade</label>
                            <input
                                type="text"
                                className={inputClass()}
                                placeholder="Ex: 50 sacas/ha"
                                value={formData.produtividade}
                                onChange={(e) => setFormData(prev => ({ ...prev, produtividade: e.target.value }))}
                            />
                        </div>

                        {/* Utiliza Cultura */}
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                className="h-5 w-5 rounded border-gray-300"
                                checked={formData.utilizaCultura}
                                onChange={(e) => setFormData(prev => ({ ...prev, utilizaCultura: e.target.checked }))}
                            />
                            <label className="text-gray-700">Utiliza Cultura?</label>
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

export default CadastroProdutos;
