import {
    useEffect,
    useState,
    createContext,
    } from 'react';
  import {
    BigNumber,
    Contract,
    providers,
  } from 'ethers'
  import contractAddress from '../address.json';
  import Voting from '../artifacts/contracts/Voting.sol/Voting.json';
  import { getAddress } from 'ethers/lib/utils';

const UserContext = createContext();

const UserContextProvider = ({ children }) => {
    const [admin, setAdmin] = useState();;
  const [user, setUser] = useState();
  const [chainId, setChainId] = useState();
  const [listVoters, setVotersList] = useState([]);
  const [propsArray, setPropsArray] = useState([]);
  const [provider, setProvider] = useState();
  const [voting, setVoting] = useState();
  const [workflow, setWorkflow] = useState();
  const [display, setDisplay] = useState(false);
  const [displayVoters, setDisplayVoters] = useState(false);
  const [id, setId] = useState("");
  const [votersWhoVoted, setVotersWhoVoted] = useState([]);
  const [winningId, setWinning] = useState();
  const [winningProp, setWinningProp] = useState("");
  const [displayWinner, setDisplayWinner] = useState(false);
  const [votedFor, setVotedFor] = useState('');
  const currentStatus = ["Registering voters", "Submiting proposals", "Proposals submission ended", "Voting session started", "voting session ended", "Votes have been tallied"];
  


  useEffect(() => {
    (async function () {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

        setUser(getAddress(accounts[0]));

        setProvider(new providers.Web3Provider(window.ethereum));
      }

      window.ethereum.on('accountsChanged', (accounts) => {
        setUser(getAddress(accounts[0]));
      });

      window.ethereum.on('chainChanged', (newChainId) => {
        setChainId(newChainId);
      });
    })();
  }, []);

  useEffect(() => {
    (async function () {
      if (provider) {
        const signer = provider.getSigner();

        setVoting(new Contract(
          contractAddress.scaddress,
          Voting.abi,
          signer,
        ));
      }
    })();
  }, [provider]);

  useEffect(() => {
    (async function () {
      if (voting) {
        setAdmin(getAddress(await voting.owner()));

      }
    })();
  }, [voting]);

  useEffect(() => {
    (async function () {
      if (voting) {
        let i = await voting.workflowStatus();

        setWorkflow(BigNumber.from(i).toNumber());
      }
    })();
  }, [voting]);

  useEffect(() => {
    (async function () {
      if (voting) {
        let winningId = await voting.winningProposalID();
        setWinning(BigNumber.from(winningId).toNumber());
      }
    })();
  }, [voting]);

    return (
        <UserContext.Provider value={{
            user,
            chainId,
            admin,
            voting,
            workflow,
            setWorkflow,
            currentStatus,
            propsArray,
            setPropsArray,
            display,
            setDisplay,
            id,
            setId,
            votersWhoVoted,
            setVotersWhoVoted,
            winningId,
            winningProp,
            setWinningProp,
            listVoters,
            setVotersList,
            displayVoters, 
            setDisplayVoters,
            displayWinner,
            setDisplayWinner,
            votedFor,
            setVotedFor
            }}>
          {children}
        </UserContext.Provider>
      );
};

export {UserContext, UserContextProvider };