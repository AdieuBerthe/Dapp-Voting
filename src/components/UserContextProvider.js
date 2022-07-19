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
  const [isUserRegistered, setUserRegistered] = useState(false);
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
    // eslint-disable-next-line
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
        if (workflow === 3) {
          let listProposals = await voting.queryFilter(voting.filters.ProposalRegistered());
          for (let i = 0; i < listProposals.length; i++) {
            let prop = await voting.getOneProposal(i);
            let propdesc = prop.description;
            setPropsArray((propsArray) => [...propsArray, [[i, propdesc]]]);
          }
        }
      }
    })();
    // eslint-disable-next-line
  }, [workflow]);

  useEffect(() => {
    (async function () {
      if (voting) {
        setWinning(await voting.winningProposalID());
      }
    })();
    // eslint-disable-next-line
  }, [workflow]);

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
        setUserRegistered(false);
        let userRegistered = await voting.getVoter(user);
        if (userRegistered[0]) {
          setUserRegistered(true);
        }
      }
    })();
    // eslint-disable-next-line
  }, [user, voting, workflow]);



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
      setVotedFor,
      isUserRegistered
    }}>
      {children}
    </UserContext.Provider>
  );
};

export { UserContext, UserContextProvider };