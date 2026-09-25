import React, { FormEvent, useEffect, useRef, useState } from 'react';

export interface ChatMessage {
    id: number
    text: string
    user: string
    isSpectator: boolean
    moveNum: number
    role: 'white' | 'black' | 'spectator'
    sentAt?: number
}

interface GameChatProps {
    messages: ChatMessage[]
    onSend?: (text: string) => void
    disabled?: boolean
    readOnly?: boolean
    emptyText?: string
}

function displayName(user: string) {
    const parts = user.split('|')
    if (parts.length > 1)
        return { title: parts[0], username: parts.slice(1).join('|') }
    return { title: undefined, username: user }
}

function formatMoveLabel(moveNum: number) {
    if (moveNum <= 0)
        return '0'
    const fullMove = Math.ceil(moveNum / 2)
    return moveNum % 2 === 1 ? `${fullMove}.w` : `${fullMove}.b`
}

function GameChat(props: GameChatProps) {
    const [draft, setDraft] = useState('')
    const listRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const el = listRef.current
        if (el)
            el.scrollTop = el.scrollHeight
    }, [props.messages])

    function submit(e: FormEvent) {
        e.preventDefault()
        const text = draft.trim()
        if (!text || props.disabled || props.readOnly || !props.onSend)
            return
        props.onSend(text)
        setDraft('')
    }

    return (
        <div className="game-chat">
            <div className="game-chat-header">Chat</div>
            <div className="game-chat-messages" ref={listRef}>
                {props.messages.length === 0 ? (
                    <p className="game-chat-empty">{props.emptyText || 'No messages yet'}</p>
                ) : (
                    props.messages.map((msg) => {
                        const name = displayName(msg.user)
                        return (
                            <div key={msg.id} className={`game-chat-msg role-${msg.role}`}>
                                <div className="game-chat-body">
                                    <span className="game-chat-author">
                                        {name.title ? <span className="title">{name.title} </span> : null}
                                        {name.username}
                                        {msg.role === 'spectator' ? <span className="game-chat-role"> · spec</span> : null}
                                    </span>
                                    <span className="game-chat-text">{msg.text}</span>
                                </div>
                                <span className="game-chat-move" title={`Move ${msg.moveNum}`}>
                                    {formatMoveLabel(msg.moveNum)}
                                </span>
                            </div>
                        )
                    })
                )}
            </div>
            {!props.readOnly ? (
                <form className="game-chat-form" onSubmit={submit}>
                    <input
                        type="text"
                        maxLength={250}
                        value={draft}
                        disabled={props.disabled}
                        placeholder="Say something…"
                        onChange={(e) => setDraft(e.target.value)}
                        autoComplete="off"
                    />
                    <button type="submit" disabled={props.disabled || !draft.trim()}>
                        Send
                    </button>
                </form>
            ) : null}
        </div>
    )
}

export default GameChat
