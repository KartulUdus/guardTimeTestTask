import React from "react"
import axios from "axios"
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import InfiniteScroll from "react-infinite-scroll-component"

interface ListProps {}
interface ListState {
    data: {
        id: string,
        filename: string,
        author: string,
        created_at: string,
        size: number,
        checksum: undefined|boolean,
        schema: undefined|boolean,
        signature: undefined|boolean,
    }[],
    currentPage: number,
    maxPageNr: number,
    reqAttempts: number,
    runningMassCheck: boolean,
}

class documentList extends React.Component<ListProps, ListState, boolean> {
    private _isMounted = false


    constructor(props: ListProps) {
        super(props)
        this.state = {
            data:
                [],
            currentPage: 1,
            maxPageNr: 1,
            reqAttempts: 0,
            runningMassCheck: false,
        }
        this.getDocumentList = this.getDocumentList.bind(this)
        this.checkAllDocuments = this.checkAllDocuments.bind(this)

    }
    componentDidMount() {
        this._isMounted = true
        this._isMounted && this.getDocumentList(true)
    }
    componentWillUnmount() {
        this._isMounted = false
    }
    render() {
        return (
            <div>
                <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={true}
                    newestOnTop={true}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                />

                <br/>
                <button disabled={this.state.runningMassCheck} onClick={ this.checkAllDocuments }> Check All Documents </button>
                <br/>
                <InfiniteScroll
                    dataLength={this.state.data.length}
                    next={() => this.getDocumentList(false)}
                    hasMore={this.state.maxPageNr + 1 > this.state.currentPage}
                    loader={<h4>Loading more</h4>}
                >
                    <table>
                        <tbody>
                            <tr className="table">
                                <th className="table-cell">Index</th>
                                <th className="table-cell">Filename</th>
                                <th className="table-cell">Author</th>
                                <th className="table-cell">Created at</th>
                                <th className="table-cell">Size</th>
                                <th className="table-cell">Validate Checksum</th>
                                <th className="table-cell">Validate Schema</th>
                                <th className="table-cell">Validate Signature</th>
                                <th className="table-cell">Validation result</th>

                            </tr>
                            {this.state.data.map((i, index) => (
                                <tr className="table" key={i.id}>
                                    <td className="table-cell">#{index + 1}</td>
                                    <td className="table-cell">{i.filename}</td>
                                    <td className="table-cell">{i.author}</td>
                                    <td className="table-cell">{new Date(i.created_at).toLocaleDateString()}</td>
                                    <td className="table-cell">{Math.round(i.size / 10000 ) / 100} Mb</td>
                                    <td className="table-cell">
                                        {typeof i.checksum === 'undefined' &&
                                            <button onClick={ () => {this.checkValidate('checksum', i.id)} }>validate checksum</button>
                                        }
                                        {i.checksum &&
                                            <b>Valid</b>
                                        }
                                        {!i.checksum && typeof i.checksum !== 'undefined' &&
                                            <b>Invalid</b>
                                        }
                                    </td>
                                    <td className="table-cell">
                                        {typeof i.schema === 'undefined' &&
                                            <button onClick={ () => {this.checkValidate('schema', i.id)} }>validate schema</button>
                                        }
                                        {i.schema &&
                                            <b>Valid</b>
                                        }
                                        {!i.schema && typeof i.schema !== 'undefined' &&
                                            <b>Invalid</b>
                                        }
                                    </td>
                                    <td className="table-cell">
                                        {typeof i.signature === 'undefined' &&
                                            <button onClick={ () => {this.checkValidate('signature', i.id)} }>validate signature</button>
                                        }
                                        {i.signature &&
                                            <b>Valid</b>
                                        }
                                        {!i.signature && typeof i.signature !== 'undefined' &&
                                            <b>Invalid</b>
                                        }
                                    </td>
                                    <td className="table-cell">
                                        {(i.signature === false || i.checksum === false || i.schema === false) &&
                                        <b>Not Valid</b>
                                        }
                                        {(i.signature === true && i.checksum === true && i.schema === true) &&
                                        <b>Valid</b>
                                        }
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>



                </InfiniteScroll>
                {this.state.maxPageNr === this.state.currentPage &&
                <b>You've reached the end</b>
                }
            </div>
        )
    }
    sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }
    async checkAllDocuments(){
        if(this.state.runningMassCheck) return
        this.setState(state => {
            const tempState = { ...state }
            tempState.runningMassCheck = true
            return tempState
        })
        let promises: any = []
        this.state.data.map(doc => {
            if(doc.checksum !== false && doc.schema !==false && doc.signature !== false) {
                promises.push(this.checkValidate('checksum', doc.id))
                promises.push(this.checkValidate('schema', doc.id))
                promises.push(this.checkValidate('signature', doc.id))
                return true
            }
        })
        await Promise.all(promises).then(() => {
            this.setState(state => {
                const tempState = { ...state }
                tempState.runningMassCheck = false
                return tempState
            })
        })

    }
    async checkValidate(type: 'checksum'|'schema'|'signature', id: string) {
        let result: { data: { valid: boolean } }
        let url: string
        switch (type) {
            case 'checksum':
                url = `http://fe-test.guardtime.com/documents/${id}/validateChecksum`
                break
            case 'schema':
                url = `http://fe-test.guardtime.com/documents/${id}/validateSchema`
                break
            case 'signature':
                url = `http://fe-test.guardtime.com/documents/${id}/validateSignature`
                break
            default:
                url = 'invalid'
        }
        try{
            result = await axios.post(url)
            this.setState(state => {
                state.data.map(i => {
                    if(i.id === id) i[type] = result.data.valid
                    return true
                })
                return state
            })
            return
        } catch(e) {
            toast.error(e.toJSON().message, {
                position: "top-right",
                autoClose: 2000,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            })
            return
        }

    }
    retryGettingDocuments(shouldClear: boolean|undefined){
        this.getDocumentList(shouldClear)
    }
    async getDocumentList(shouldClear: boolean | undefined){
        if(this.state.maxPageNr < this.state.currentPage) return
        try {
            const { data } = await axios({
                url: 'http://fe-test.guardtime.com/documents',
                timeout: 500,
                method: 'GET',
                params: { page: this.state.currentPage }
            })
            let tempReqAttempts = 0
            let tempData = [ ...this.state.data ]
            const maxPageNr = data.meta.pagesCount
            const newPageNr = this.state.currentPage + 1
            if(shouldClear) tempData = []
            this._isMounted && this.setState(state => {
                const tempState = { ...state }
                tempState.data = [...tempData, ...data.data]
                tempState.currentPage = newPageNr
                tempState.maxPageNr = maxPageNr
                tempState.reqAttempts = tempReqAttempts
                return tempState
            })
        }
        catch(e) {
            await this.sleep(this.state.reqAttempts * 300)
            this._isMounted && this.setState(state => {
                const tempState = { ...state }
                tempState.reqAttempts += 1
                return tempState
            })

            toast.error(e.toJSON().message, {
                position: "top-right",
                autoClose: 2000,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            })
            if (this.state.reqAttempts <= 6) return this.retryGettingDocuments(shouldClear)
        }
    }

}


export default documentList
