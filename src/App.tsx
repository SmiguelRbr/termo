
import { useEffect, useRef, useState } from 'react'
import './App.css'
import { PALAVRAS } from './palavras';

function App() {
  const [squares, setSquares] = useState<(string | null)[]>(Array(30).fill(null))
  const [ativo, setAtivo] = useState<number>(0)

  const linhas = [
    [0, 1, 2, 3, 4],
    [5, 6, 7, 8, 9],
    [10, 11, 12, 13, 14],
    [15, 16, 17, 18, 19],
    [20, 21, 22, 23, 24],
    [25, 26, 27, 28, 29]
  ]
  const [linhaAtual, setLinhaAtual] = useState<number>(0)
  const [cores, setCores] = useState<string[]>(Array(30).fill(''));


  const [palavraSecreta, setPalavraSecreta] = useState(() => {
    const aleatorio = Math.floor(Math.random() * PALAVRAS.length);
    return PALAVRAS[aleatorio].toUpperCase()
      ;
  });

  console.log("Palavra Secreta:", palavraSecreta);

  function ativar(index: number) {
    if (!linhas[linhaAtual].includes(index)) return
    setAtivo(index)


  }

  console.log(ativo)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (linhaAtual > 5) return
      const key = event.key.toUpperCase();

      if (/^[A-Z]$/i.test(key)) {

        if (linhas[linhaAtual].includes(ativo)) {
          const newSquares = [...squares]
          newSquares[ativo] = key;
          setSquares(newSquares)

          setAtivo(prev => prev + 1)

        }

      }

      if (key === 'BACKSPACE') {
        const newSquares = [...squares];

        if (squares[ativo] !== null) {
          newSquares[ativo] = null;
          setSquares(newSquares);
        } else if (ativo > linhas[linhaAtual][0]) {
          newSquares[ativo - 1] = null;
          setSquares(newSquares);
          setAtivo(prev => prev - 1);
        }
      }

      if (key === 'ARROWRIGHT') {

        const limite = linhas[linhaAtual][4];

        if (ativo <= limite) {
          if (ativo == linhas[linhaAtual][4]) return;

          setAtivo(prev => prev + 1);
        }
      }

      if (key === 'ARROWLEFT') {

        if (ativo === linhas[linhaAtual][0]) return;
        setAtivo(prev => prev - 1);
      }


      if (key === 'ENTER') {
        const indicesDaLinha = linhas[linhaAtual];

        const palavraIncompleta = indicesDaLinha.some(index => squares[index] === null);
        if (palavraIncompleta) return;

        const tentativa = indicesDaLinha.map(index => squares[index]).join('');

        if (!PALAVRAS.includes(tentativa.toLocaleLowerCase())) {
          alert("Palavra não existe!");
          return;
        }

        const novasCores = [...cores];
        const arraySecreto = palavraSecreta.split(''); // ['T','E','R','M','O']
        const arrayTentativa = tentativa.split('');    // ['T','E','S','T','E']


        indicesDaLinha.forEach((indexGlobal, i) => {
          if (arrayTentativa[i] === arraySecreto[i]) {
            novasCores[indexGlobal] = 'verde';
            arraySecreto[i] = null as any
            arrayTentativa[i] = null as any
          }
        });


        indicesDaLinha.forEach((indexGlobal, i) => {

          if (arrayTentativa[i] !== null && arraySecreto.includes(arrayTentativa[i])) {
            novasCores[indexGlobal] = 'amarelo';

            const indexNoSecreto = arraySecreto.indexOf(arrayTentativa[i]);
            arraySecreto[indexNoSecreto] = null as any;
          } else if (arrayTentativa[i] !== null) {

            novasCores[indexGlobal] = 'cinza';
          }
        });

        indicesDaLinha.forEach((indexGlobal, i) => {

          // Cada quadrado demora 500ms a mais que o anterior para começar
          setTimeout(() => {
            setCores(prev => {
              const novoArray = [...prev];
              // Aplica a cor calculada (verde/amarelo/cinza) neste quadrado específico
              novoArray[indexGlobal] = novasCores[indexGlobal];
              return novoArray;
            });
          }, i * 400);

        });

        // --- MUDANÇA DE LINHA OU FIM DE JOGO ---

        // Esperamos 5 cartas * 500ms = 2500ms (2.5 segundos)
        setTimeout(() => {

          // 1. Verificamos Vitória
          if (tentativa === palavraSecreta) {
            alert("GANHASTE! 🎉");
            return; // Acabou, não muda de linha
          }

          // 2. Verificamos Derrota
          if (linhaAtual === 5) {
            alert(`PERDESTE! A palavra era ${palavraSecreta}`);
            return;
          }

          // 3. Se o jogo continua, muda a linha e o foco
          setLinhaAtual(prev => prev + 1);
          setAtivo(linhas[linhaAtual + 1][0]);

        }, 2500); // 2500ms = tempo exato para as 5 animações terminarem
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    }

  }, [ativo, squares, linhaAtual])

  function getClassName(index: number) {
    // 1. Verifica se o quadrado já tem uma cor definida (verde/amarelo/cinza)
    if (cores[index]) {
      return `square ${cores[index]}`; // Retorna "square verde", por exemplo
    }

    // 2. Lógica antiga de linhas ativas
    if (!linhas[linhaAtual].includes(index)) {
      return 'square desativo';
    }

    if (index === ativo) {
      return 'square ativo';
    }

    return 'square';
  }
  return (
    <>
      <div className="container">
        {squares.map((letter, index) => (
          <div
            key={index}
            className={getClassName(index)}
            onClick={() => ativar(index)}
          >
            {letter}
          </div>
        ))}
      </div>
    </>
  )
}

export default App
