# Metin2 Item Gallery ⚔️

Uma galeria web moderna, performática e responsiva para visualizar ícones e itens do jogo Metin2. 

Este projeto foi construído do zero com foco em **alta performance** e **design premium**, substituindo milhares de tags HTML estáticas por uma renderização dinâmica via JavaScript.

## ✨ Funcionalidades

- 🚀 **Alta Performance (Lazy Loading):** As imagens só são carregadas e renderizadas na tela quando o usuário rola a página, garantindo carregamento instantâneo mesmo com milhares de itens.
- 🎨 **Design Moderno (UI/UX):** Interface com tema escuro (Dark Mode) e cabeçalho com efeito *Glassmorphism*.
- 📱 **Totalmente Responsivo:** Layout utilizando CSS Grid que se adapta perfeitamente a qualquer tamanho de tela (Desktop, Tablet ou Mobile).
- 🖱️ **Tooltips Customizados:** Ao passar o mouse sobre os itens, um tooltip elegante acompanha o cursor mostrando o ID do item formatado (zeros à esquerda são removidos de IDs numéricos).
- ⚡ **Renderização Dinâmica:** Os itens são injetados no DOM de forma otimizada usando `DocumentFragment` através do Vanilla JS.

## 🛠️ Tecnologias Utilizadas

- **HTML5:** Estrutura limpa e semântica.
- **CSS3:** Grid Layout, variáveis CSS, backdrop-filter e animações (sem uso de frameworks pesados).
- **Vanilla JavaScript (ES6):** Toda a lógica de renderização e interatividade.

## 🚀 Como Executar

O projeto é 100% estático e roda direto no navegador (client-side), sem necessidade de rodar servidores, Node.js ou banco de dados.

1. Clone o repositório ou baixe os arquivos.
2. Dê um duplo clique no arquivo `index.html` para abri-lo no seu navegador favorito.
3. Aproveite a galeria!

## 📂 Adicionando Novas Imagens

Para manter o HTML limpo, os nomes de todas as imagens ficam armazenados no arquivo `imageList.js`. 
Se você adicionar novas imagens na pasta `img/`, você precisará atualizar a lista no `imageList.js`.

Você pode gerar uma lista atualizada rapidamente usando o PowerShell na pasta do projeto:

```powershell
$files = (Get-ChildItem -Path img -File | Select-Object -ExpandProperty Name) | ConvertTo-Json -Compress; "const images = $files;" | Out-File -Encoding utf8 imageList.js
```

## 🤝 Contribuição

Sinta-se à vontade para fazer um *fork* do projeto, abrir *issues* ou enviar *pull requests* com melhorias!

---
Feito com dedicação para a comunidade de Metin2!
