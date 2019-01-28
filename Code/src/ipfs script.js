<script type="text/javascript">
    
    function uploadInvoice() {
        
        const reader = new FileReader();
        reader.onloadend = function () {
            //const ipfs = window.IpfsApi('localhost', 5001) // Connect to IPFS
            const ipfs = window.IpfsApi('ipfs.infura.io', 5001, { protocol: 'https' }) // Connect to IPFS
            const buf = buffer.Buffer(reader.result) // Convert data into buffer
            ipfs.files.add(buf, (err, result) => { // Upload buffer to IPFS
                if (err) {
                    console.error(err)
                    return
                }
                let url = `https://ipfs.io/ipfs/${result[0].hash}`
                console.log(`Url --> ${url}`)
                App.processDocument(result[0].hash, "invoice");
            })
        }
        const invoice = document.getElementById("invoice");
        reader.readAsArrayBuffer(invoice.files[0]); // Read Provided File
    }

    function uploadReceipt() {
        const reader = new FileReader();
        reader.onloadend = function () {
            //const ipfs = window.IpfsApi('localhost', 5001) // Connect to IPFS
            const ipfs = window.IpfsApi('ipfs.infura.io', 5001, { protocol: 'https' }) // Connect to IPFS
            const buf = buffer.Buffer(reader.result) // Convert data into buffer
            ipfs.files.add(buf, (err, result) => { // Upload buffer to IPFS
                if (err) {
                    console.error(err)
                    return
                }
                let url = `https://ipfs.io/ipfs/${result[0].hash}`
                console.log(`Url --> ${url}`)
                //muliplier = 1 means receipt
                App.processDocument(result[0].hash, "receipt");
            })
        }
        const receipt = document.getElementById("receipt");
        reader.readAsArrayBuffer(receipt.files[0]); // Read Provided File
    }
</script>