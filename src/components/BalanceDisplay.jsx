import { useSolana } from '../contexts/SolanaContext';

const BalanceDisplay = () => {
  const { balance, updateBalance, publicKey } = useSolana();

  return (
    <div className="balance-display">
      <h3>Your Balance</h3>
      <div className="balance-amount">
        {balance.toFixed(2)} SOL
      </div>
      <button 
        className="refresh-btn" 
        onClick={() => publicKey && updateBalance(publicKey)}
      >
        Refresh
      </button>
    </div>
  );
};

export default BalanceDisplay;