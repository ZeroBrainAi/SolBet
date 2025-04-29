import { useState, useEffect } from 'react';
import { useSolana } from '../contexts/SolanaContext';

const TransactionHandler = () => {
  const { connection, publicKey } = useSolana();
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (!publicKey) return;

    const fetchTransactions = async () => {
      const txList = await connection.getConfirmedSignaturesForAddress2(
        publicKey,
        { limit: 5 }
      );
      setTransactions(txList);
    };

    fetchTransactions();
    const interval = setInterval(fetchTransactions, 30000);

    return () => clearInterval(interval);
  }, [publicKey, connection]);

  return (
    <div className="transaction-history">
      <h4>Recent Transactions</h4>
      {transactions.length > 0 ? (
        <ul>
          {transactions.map((tx) => (
            <li key={tx.signature}>
              <a 
                href={`https://solscan.io/tx/${tx.signature}`} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                {tx.signature.slice(0, 10)}...{tx.signature.slice(-10)}
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p>No recent transactions</p>
      )}
    </div>
  );
};

export default TransactionHandler;