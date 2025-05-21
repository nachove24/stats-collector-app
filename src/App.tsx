
import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Index from './pages/Index';
import Setup from './pages/Setup';
import Match from './pages/Match';
import Summary from './pages/Summary';
import Record from './pages/Record';
//import Tutorial from './pages/Tutorial';
//import Settings from './pages/Settings';

const App: React.FC = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Index} />
        <Route path="/setup" component={Setup} />
        <Route path="/match" component={Match} />
        <Route path="/summary/:id" component={Summary} />
        <Route path="/record" component={Record} />
        {/*<Route path="/tutorial" component={Tutorial} />
        <Route path="/settings" component={Settings} />*/}
      </Switch>
    </Router>
  )
}

export default App

