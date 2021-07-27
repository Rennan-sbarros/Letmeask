import logoImg from '../assets/images/logo.svg'
import { Button } from '../components/Button';
import { RoomCode } from '../components/RoomCode';
import { useParams } from 'react-router-dom';

import '../styles/room.scss';
import { FormEvent, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { database } from '../services/firebase';
import { useEffect } from 'react';
import { Question } from '../components/Question';

type FirebaseQuestions = Record<string, {
    author: {
        name: string;
        avatar: string;
    }
    content: string;
    isAnswered: boolean;
    isHighlighted: boolean;
}>

type QuestionType = {
    id: string;
    author: {
        name: string;
        avatar: string;
    }
    content: string;
    isAnswered: boolean;
    isHighlighted: boolean; 
}

type RoomParams = {
    id: string;
}
export function Room(){
    const { user } = useAuth();
    const params = useParams<RoomParams>();
    const [newQuestion, setNewQuestion] = useState('');
    const [questions, setQuestions] = useState<QuestionType[]>([]);
    const [title, setTitle] = useState('')

    const roomId = params.id;

    useEffect(() => { //Uma função que dispara um evento sempre que uma informação mudar.
        const roomRef = database.ref(`rooms/${roomId}`);

        roomRef.on('value', room => { 
            const databaseRoom = room.val();
            const firebaseQuestions:FirebaseQuestions = databaseRoom.questions ?? {};

            const parsedQuestions = Object.entries(firebaseQuestions).map(([key, value]) => {
                return {
                    id: key,
                    content: value.content,
                    author: value.author,
                    isHighlighted: value.isHighlighted,
                    isAnswered: value.isAnswered,
                }
            })

            setTitle(databaseRoom.title);
            setQuestions(parsedQuestions);
        })
    }, [roomId]); 

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
                    <RoomCode code={roomId} />
                </div>
            </header>

            <main className="content">
                <div className="room-title">
                    <h1>Sala {title}</h1>
                    { questions.length > 0 && <span>{questions.length} Pergunta(s)</span>}
                </div>

                <form onSubmit={handleSendQuestion}>
                    <textarea
                        placeholder="O que você quer perguntas?"
                        onChange={event => setNewQuestion(event.target.value)} 
                        value={newQuestion}
                    />

                    <div className="form-footer">
                        { user ? (
                            <div className="user-info">
                                <img src={user.avatar} alt={user.name} />
                                <span>{user.name}</span>
                            </div> 
                        ) : (
                            <span>Para enviar uma pergunta, <button>faça seu login.</button></span>
                        )}
                        <Button type="submit" disabled={!user}>Enviar pergunta</Button>
                    </div>
                </form>

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