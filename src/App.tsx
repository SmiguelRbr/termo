import { useEffect, useState } from 'react'
import './App.css'
import { PALAVRAS } from './palavras';

function App() {
  const [squares, setSquares] = useState<(string | null)[]>(Array(30).fill(null))
  const [ativo, setAtivo] = useState<number>(0)
  const [ultimoDigitado, setUltimoDigitado] = useState<number | null>(null);
  const [efeitoLinha, setEfeitoLinha] = useState<null | 'shake'>(null);
  const [gameOver, setgameOver] = useState<boolean>(false)
  const [vitoria, setVitoria] = useState<boolean>(false)
  const [coresTeclado, setCoresTeclado] = useState<Record<string, string>>({});


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
    return PALAVRAS[aleatorio].toUpperCase();
  });

  const TECLADO = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'BACKSPACE'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M', 'ENTER']
  ];

    console.log(palavraSecreta)

  function pressionarTecla(tecla: string) {
    const evento = new KeyboardEvent('keydown', {
      key: tecla === 'BACKSPACE' ? 'Backspace' : tecla,
    });

    window.dispatchEvent(evento);
  }


  function ativar(index: number) {
    if (!linhas[linhaAtual].includes(index)) return
    setAtivo(index)
  }

  // --- EFEITO 1: LÓGICA DO TECLADO ---
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (linhaAtual > 5) return
      if (ativo > 30) return; // Proteção geral

      const key = event.key.toUpperCase();

      // DIGITAR LETRAS
      if (/^[A-Z]$/i.test(key)) {
        if (linhas[linhaAtual].includes(ativo)) {
          const newSquares = [...squares]
          newSquares[ativo] = key;
          setSquares(newSquares)

          setUltimoDigitado(ativo) // Ativa a animação pop
          setAtivo(prev => prev + 1)
        }
      }

      // APAGAR
      if (key === 'BACKSPACE') {
        const newSquares = [...squares];
        if (squares[ativo] !== undefined && squares[ativo] !== null) {
          newSquares[ativo] = null;
          setSquares(newSquares);
        } else if (ativo > linhas[linhaAtual][0]) {
          newSquares[ativo - 1] = null;
          setSquares(newSquares);
          setAtivo(prev => prev - 1);
        }
      }

      // SETAS
      if (key === 'ARROWRIGHT') {
        const limite = linhas[linhaAtual][4];
        // Permite ir até ao limbo (ex: 5) mas não passar dele se tiver vazio
        if (ativo <= limite) {
          if (ativo === linhas[linhaAtual][4] && squares[ativo] === null) return;
          // Pequena correção lógica para setas:
          if (ativo < linhas[linhaAtual][4] + 1) setAtivo(prev => prev + 1);
        }
      }

      if (key === 'ARROWLEFT') {
        if (ativo === linhas[linhaAtual][0]) return;
        setAtivo(prev => prev - 1);
      }

      // ENTER
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
        const arraySecreto = palavraSecreta.split('');
        const arrayTentativa = tentativa.split('');

        // Passo 1: Verdes
        indicesDaLinha.forEach((indexGlobal, i) => {
          if (arrayTentativa[i] === arraySecreto[i]) {
            novasCores[indexGlobal] = 'verde';
            arraySecreto[i] = null as any
            arrayTentativa[i] = null as any
          }
        });

        // Passo 2: Amarelos e Cinzas
        indicesDaLinha.forEach((indexGlobal, i) => {
          if (arrayTentativa[i] !== null && arraySecreto.includes(arrayTentativa[i])) {
            novasCores[indexGlobal] = 'amarelo';
            const indexNoSecreto = arraySecreto.indexOf(arrayTentativa[i]);
            arraySecreto[indexNoSecreto] = null as any;
          } else if (arrayTentativa[i] !== null) {
            novasCores[indexGlobal] = 'cinza';
          }
        });

        setCoresTeclado(prev => {
          const novo = { ...prev };

          indicesDaLinha.forEach((indexGlobal, i) => {
            const letra = squares[indexGlobal]!;
            const cor = novasCores[indexGlobal];

            if (cor === 'verde') {
              novo[letra] = 'verde';
            }
            else if (cor === 'amarelo' && novo[letra] !== 'verde') {
              novo[letra] = 'amarelo';
            }
            else if (!novo[letra]) {
              novo[letra] = 'cinza';
            }
          });

          return novo;
        });

        // Animação Sequencial (Cascata)
        indicesDaLinha.forEach((indexGlobal, i) => {
          setTimeout(() => {
            setCores(prev => {
              const novoArray = [...prev];
              novoArray[indexGlobal] = novasCores[indexGlobal];
              return novoArray;
            });
          }, i * 250);
        });

        setTimeout(() => {
          if (linhaAtual === 5) {
            setEfeitoLinha('shake')

            setTimeout(() => {
              setgameOver(true)
              setEfeitoLinha(null)
            }, 500)

          } else if (tentativa === palavraSecreta) {
            setVitoria(true)
          } else {
            setLinhaAtual(prev => prev + 1)
          }

        }, 1600)
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    }
  }, [ativo, linhaAtual]);



  useEffect(() => {
    if (ultimoDigitado !== null) {
      const timer = setTimeout(() => {
        setUltimoDigitado(null);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [ultimoDigitado]);



  function getClassName(index: number) {
    if (cores[index]) return `square ${cores[index]}`;

    if (!linhas[linhaAtual].includes(index)) return 'square desativo';

    if (index === ativo) return 'square ativo';

    if (index === ultimoDigitado) return 'square aumentar';

    return 'square';
  }
  return (
    <>

    <header>
      <h2>TERMO</h2>
    </header>

      {vitoria === true ? <div className='Vitoria'><p>palavra correta!</p></div> : gameOver === true ? <div className='Derrota'><p>palavra certa: {palavraSecreta.toLocaleLowerCase()}</p></div> : ''}
      <div className="container">
        {linhas.map((linha, i) => (
          <div
            key={i}
            className={`linha ${efeitoLinha === 'shake' && linhaAtual === i ? 'shake' : ''}`}
          >
            {linha.map(index => (
              <div
                key={index}
                className={getClassName(index)}
                onClick={() => ativar(index)}
              >
                <span className="label">{squares[index]}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="tecladoCont">
        {TECLADO.map((linha, i) => (
          <div
            key={i}
            className={`linhaTeclado ${i === 1 ? 'offset1' :
              i === 2 ? 'offset2' :
                ''
              }`}
          >
            {linha.map((tecla) => (
              <button
                key={tecla}
                className={`tecla ${coresTeclado[tecla] || ''} ${tecla === 'ENTER' ? 'enter' : ''
                  }`}
                onClick={() => pressionarTecla(tecla)}
              >
                {tecla === 'BACKSPACE' ? '⌫' : tecla}
              </button>

            ))}
          </div>
        ))}
      </div>


    </>
  )
}

export default App