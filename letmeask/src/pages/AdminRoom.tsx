import logoImg from '../assets/images/logo.svg'
import { Button } from '../components/Button';
import { RoomCode } from '../components/RoomCode';
import { useParams } from 'react-router-dom';
import { FormEvent, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { database } from '../services/firebase';
import { Question } from '../components/Question';
import { useRoom } from '../hooks/useRoom';

import '../styles/room.scss';

type RoomParams = {
    id: string;
}

export function AdminRoom(){
    const { user } = useAuth();
    const params = useParams<RoomParams>();
    const [newQuestion, setNewQuestion] = useState('');
    const roomId = params.id;

    const { title, questions} = useRoom(roomId);

    async function handleSendQuestion(event: FormEvent){
        event.preventDefault();

        if(newQuestion.trim() === '') {
            return;
        }

        if(!user){
            throw new Error('You must be logged in')
        }

        const question = {
            content: newQuestion,
            author: {
                name: user.name,
                avatar: user.avatar,
            },
            isHighLighted: false, // Determina se a pergunta está sendo respondida atualmente
            isAnswered: false, // Se a pergunta já foi respondida ou não. Então, começa com false.
        };

        await database.ref(`rooms/${roomId}/questions`).push(question);

        setNewQuestion(''); //Ao fazer pergunta, a pergunta some. 
    }

    return(
        <div id="page-room">
            <header>
                <div className="content">   
                    <img src={logoImg} alt="Letmeask" />
                    <div>
                        <RoomCode code={roomId} />
                        <Button isOutlined>Encerrar sala</Button>
                    </div>
                </div>
            </header>

            <main className="content">
                <div className="room-title">
                    <h1>Sala {title}</h1>
                    { questions.length > 0 && <span>{questions.length} Pergunta(s)</span>}
                </div>

                <div className="question-list">
                    {questions.map(question => { //map vai percorrer as perguntas e retornar as respostas
                        return (
                            <Question 
                                key={question.id} //Identifica a diferença de uma pergunta para outra pelo id para performance. *Algoritmo de reconciliação 
                                content={question.content}
                                author={question.author}
                            />
                        );
                    })}
                </div> 
            </main>
        </div>
    );
}