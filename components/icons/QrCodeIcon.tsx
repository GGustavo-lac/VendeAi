import React from 'react';

const QrCodeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 0H96V96H0V0ZM25.6 25.6V70.4H70.4V25.6H25.6Z" fill="white"/>
      <path d="M160 0H256V96H160V0ZM185.6 25.6V70.4H230.4V25.6H185.6Z" fill="white"/>
      <path d="M0 160H96V256H0V160ZM25.6 185.6V230.4H70.4V185.6H25.6Z" fill="white"/>
      <path d="M160 160H192V192H160V160Z" fill="white"/>
      <path d="M192 160H224V192H192V160Z" fill="white"/>
      <path d="M224 160H256V192H224V160Z" fill="white"/>
      <path d="M160 192H192V224H160V192Z" fill="white"/>
      <path d="M192 192H224V224H192V192Z" fill="white"/>
      <path d="M224 192H256V224H224V192Z" fill="white"/>
      <path d="M160 224H192V256H160V224Z" fill="white"/>
      <path d="M192 224H224V256H192V224Z" fill="white"/>
    </svg>
);

export default QrCodeIcon;
